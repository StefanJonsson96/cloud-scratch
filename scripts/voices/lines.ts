// Every line of story dialogue, with who says it — read from the story
// scripts' syntax tree, so it can't drift from what the game shows.
//
//   s.say('abuela', 'Hola, cariño.', 'Hello, dear.')    → abuela's voice
//   s.narrate('…', 'Te despiertas.')                     → the narrator
//   wordQuest(s, 'frutera', flag, { lost: […], … })      → the fruit seller
//
// Gender templates ("{herido|herida}") give both versions; the hero's name is
// left out (the recording can't know it); other dynamic text is skipped and
// falls back to the browser's voice in the game.

import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_VOICES, CAST_VOICES, NARRATOR_VOICE, heroVoice, voiceKey, type BaseVoice } from '../../src/story/voices';

export interface VoiceLine {
  key: string;
  base: BaseVoice;
  /** The voice model and its speaker (from BASE_VOICES). */
  model: string;
  speaker: number;
  /** What the voice actually says (the hero's name removed, punctuation tidied). */
  text: string;
  /** Where it comes from, for the report. */
  at: string;
}

const ROOT = join(import.meta.dirname, '../..');
const NAME = '\u0000';

/** Speaker ids in the scripts → voice ids (CAST uses a few capitalised names). */
const ALIASES: Record<string, string> = { Paco: 'paco', Leñador: 'lenador', Alpinista: 'alpinista' };

/** First elements of the [es, en] pairs in a table: `[['Hola', 'Hi'], …]` or `{ a: ['Hola', 'Hi'] }`. */
function pairFirsts(e: ts.Expression): ts.Expression[] {
  if (ts.isArrayLiteralExpression(e)) {
    const [first, second] = e.elements;
    if (e.elements.length === 2 && first && second && ts.isStringLiteralLike(first) && ts.isStringLiteralLike(second)) return [first];
    return e.elements.flatMap((x) => pairFirsts(x as ts.Expression));
  }
  if (ts.isObjectLiteralExpression(e)) return e.properties.flatMap((p) => (ts.isPropertyAssignment(p) ? pairFirsts(p.initializer) : []));
  if (ts.isAsExpression(e) || ts.isParenthesizedExpression(e)) return pairFirsts(e.expression);
  return [];
}

/** A variable's possible [es, en] pairs: from the table it was read from, or the calls that passed it in. */
function pairsOf(name: string, from: ts.Node, sf: ts.SourceFile): ts.Expression[] | undefined {
  for (let n: ts.Node | undefined = from; n; n = n.parent) {
    // A parameter: look at every call of the function in this file.
    if (ts.isFunctionDeclaration(n) && n.name) {
      const i = n.parameters.findIndex((p) => ts.isIdentifier(p.name) && p.name.text === name);
      if (i >= 0) {
        const fn = n.name.text;
        const out: ts.Expression[] = [];
        const walk = (m: ts.Node) => {
          if (ts.isCallExpression(m) && ts.isIdentifier(m.expression) && m.expression.text === fn && m.arguments[i]) out.push(...pairFirsts(m.arguments[i]));
          ts.forEachChild(m, walk);
        };
        walk(sf);
        return out;
      }
    }
  }
  // A table declared in this file.
  let found: ts.Expression[] | undefined;
  const walk = (m: ts.Node) => {
    if (ts.isVariableDeclaration(m) && ts.isIdentifier(m.name) && m.name.text === name && m.initializer) found = pairFirsts(m.initializer);
    ts.forEachChild(m, walk);
  };
  walk(sf);
  return found;
}

/** All the strings an expression can be, or undefined if it depends on game state. */
function texts(e: ts.Expression, sf: ts.SourceFile): string[] | undefined {
  const all = (list: ts.Expression[] | undefined) => {
    if (!list?.length) return undefined;
    const parts = list.map((x) => texts(x, sf));
    return parts.every(Boolean) ? parts.flat() as string[] : undefined;
  };
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
  if (ts.isParenthesizedExpression(e)) return texts(e.expression, sf);
  if (ts.isConditionalExpression(e)) {
    const a = texts(e.whenTrue, sf);
    const b = texts(e.whenFalse, sf);
    return a && b ? [...a, ...b] : undefined;
  }
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = texts(e.left, sf);
    const b = texts(e.right, sf);
    return a && b ? a.flatMap((x) => b.map((y) => x + y)) : undefined;
  }
  if (ts.isPropertyAccessExpression(e) && e.name.text === 'heroName') return [NAME];
  // '¡Hola, {name}!'.replace('{name}', s.g.heroName)
  if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'replace') {
    const [what, by] = e.arguments;
    const base = texts(e.expression.expression, sf);
    const into = by && texts(by, sf);
    if (base && what && ts.isStringLiteral(what) && into?.length === 1) return base.map((t) => t.split(what.text).join(into[0]));
    return undefined;
  }
  // clue[0], where clue is a parameter: the first element of what each call passed.
  if (ts.isElementAccessExpression(e) && ts.isIdentifier(e.expression) && ts.isNumericLiteral(e.argumentExpression) && e.argumentExpression.text === '0') {
    return all(pairsOf(e.expression.text, e, sf));
  }
  // const [es, en] = SIGNS[key] ?? ['…', '…']  /  wishes[i]
  if (ts.isIdentifier(e)) {
    const decl = findBinding(e.text, e);
    if (!decl?.initializer) return undefined;
    const sources = decl.initializer;
    const tables = ts.isBinaryExpression(sources) ? [sources.left, sources.right] : [sources];
    const out: ts.Expression[] = [];
    for (const t of tables) {
      if (ts.isElementAccessExpression(t) && ts.isIdentifier(t.expression)) out.push(...(pairsOf(t.expression.text, e, sf) ?? []));
      else out.push(...pairFirsts(t));
    }
    return all(out);
  }
  if (ts.isTemplateExpression(e)) {
    let out = [e.head.text];
    for (const span of e.templateSpans) {
      const parts = texts(span.expression, sf);
      if (!parts) return undefined;
      out = out.flatMap((x) => parts.map((p) => x + p + span.literal.text));
    }
    return out;
  }
  return undefined;
}

/** `const [es, en] = …` declaring `name` as its first element, in an enclosing block. */
function findBinding(name: string, from: ts.Node): ts.VariableDeclaration | undefined {
  for (let n: ts.Node | undefined = from.parent; n; n = n.parent) {
    if (!ts.isBlock(n) && !ts.isSourceFile(n)) continue;
    for (const st of n.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations) {
        if (ts.isArrayBindingPattern(d.name)) {
          const first = d.name.elements[0];
          if (first && ts.isBindingElement(first) && ts.isIdentifier(first.name) && first.name.text === name) return d;
        }
      }
    }
  }
  return undefined;
}

/** "{herido|herida}" → both versions. */
function genders(t: string): string[] {
  if (!/\{[^{}|]*\|[^{}|]*\}/.test(t)) return [t];
  return [t.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, '$1'), t.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, '$2')];
}

/** What to say when the line contains the hero's name: "¡Alex! Mateo me lo ha contado" → "Mateo me lo ha contado". */
export function withoutName(t: string): string {
  if (!t.includes(NAME)) return t;
  const out = t
    .replace(new RegExp(`¡${NAME}!\\s*`, 'g'), '')
    .replace(new RegExp(`,\\s*${NAME}`, 'g'), '')
    .replace(new RegExp(`${NAME},\\s*`, 'g'), '')
    .replace(new RegExp(NAME, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
  // "¡toma mi Grimorio!" at the start of the line → "¡Toma mi Grimorio!"
  return out.replace(/^([¡¿]?)(\p{Ll})/u, (_, p: string, ch: string) => p + ch.toUpperCase());
}

function voicesFor(who: string | undefined): BaseVoice[] {
  if (who === undefined) return ['f', 'm'];
  if (who === 'hero') return [heroVoice('f').base, heroVoice('m').base];
  if (who === '') return [NARRATOR_VOICE.base]; // s.ask('', …): no speaker, so the narrator
  const v = CAST_VOICES[ALIASES[who] ?? who];
  if (!v) throw new Error(`No voice for speaker "${who}" — add it to src/story/voices.ts`);
  return [v.base];
}

export function extractLines(): { lines: VoiceLine[]; skipped: string[] } {
  const files = [...readdirSync(join(ROOT, 'src/story')).map((f) => join('src/story', f)), 'src/game.ts'].filter((f) => f.endsWith('.ts'));
  const found = new Map<string, VoiceLine>();
  const skipped: string[] = [];
  const add = (who: string | undefined, es: ts.Expression | undefined, sf: ts.SourceFile, node: ts.Node, narrator = false) => {
    if (!es) return;
    const at = `${sf.fileName}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
    const list = texts(es, sf);
    if (!list) {
      skipped.push(`${at}  ${es.getText(sf).slice(0, 70)}`);
      return;
    }
    const bases = narrator ? [NARRATOR_VOICE.base] : voicesFor(who);
    for (const raw of list.flatMap(genders)) {
      if (!/\p{L}/u.test(raw.replace(NAME, ''))) continue;
      for (const base of bases) {
        const key = voiceKey(base, raw.split(NAME).join(' '));
        const { model, speaker } = BASE_VOICES[base];
        if (!found.has(key)) found.set(key, { key, base, model, speaker, text: withoutName(raw), at });
      }
    }
  };
  for (const file of files) {
    const sf = ts.createSourceFile(file, readFileSync(join(ROOT, file), 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const name = ts.isPropertyAccessExpression(callee) ? callee.name.text : ts.isIdentifier(callee) ? callee.text : '';
        const [a0, a1, , a3] = node.arguments;
        const literalWho = a0 && ts.isStringLiteral(a0) ? a0.text : undefined;
        if ((name === 'say' || name === 'ask' || name === 'quiz') && ts.isPropertyAccessExpression(callee) && a1 && !ts.isObjectLiteralExpression(a0)) {
          // s.say(who, es, en): a speaker given as a variable could be anyone.
          add(literalWho, a1, sf, node);
        } else if (name === 'narrate') {
          add(undefined, a1, sf, node, true);
        } else if ((name === 'say' || name === 'ask') && a0 && ts.isObjectLiteralExpression(a0)) {
          // dialogue.say({ es, en }) without a voice: the narrator.
          const props = new Map(a0.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(sf), p.initializer]));
          if (!props.has('voice') && !props.has('who')) add(undefined, props.get('es'), sf, node, true);
        } else if (name === 'wordQuest' && a3 && ts.isObjectLiteralExpression(a3)) {
          const who = node.arguments[1] && ts.isStringLiteral(node.arguments[1]) ? node.arguments[1].text : undefined;
          for (const p of a3.properties) {
            if (!ts.isPropertyAssignment(p) || !['lost', 'thanks', 'after'].includes(p.name.getText(sf))) continue;
            if (ts.isArrayLiteralExpression(p.initializer)) add(who, p.initializer.elements[0], sf, p);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  const lines = [...found.values()].sort((a, b) => a.key.localeCompare(b.key));
  return { lines, skipped };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { lines, skipped } = extractLines();
  process.stdout.write(JSON.stringify(lines, null, 1) + '\n');
  console.error(`${lines.length} lines to record; ${skipped.length} dynamic lines left to the browser's voice:`);
  for (const s of skipped) console.error('  ' + s);
}
