/** "Estás {cansado|cansada}" → the form that agrees with the hero's grammatical gender. */
export function agree(text: string, gender: 'm' | 'f'): string {
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (gender === 'f' ? f : m));
}
