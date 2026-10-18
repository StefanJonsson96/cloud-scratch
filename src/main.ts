import './style.css';
import { initInput } from './engine/input';
import { initSpeech } from './engine/speech';
import { Game } from './game';
import { showTitle } from './ui/title';
import { newGame, save, todayKey } from './state';

initInput();
initSpeech();

const app = document.getElementById('app')!;
const game = new Game(app);
game.stop();

async function title() {
  game.stop();
  const r = await showTitle();
  const g = r.mode === 'continue' && r.save ? r.save : newGame(r.name, r.settings);
  if (!g.stats.days.includes(todayKey())) g.stats.days.push(todayKey());
  save(g);
  await game.start(g, r.mode === 'new');
}

game.onQuit = () => void title();
void title();

// Debug hooks for automated play-testing.
(window as unknown as { __game: Game }).__game = game;
