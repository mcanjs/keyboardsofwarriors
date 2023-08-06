import { IGameLanguages } from '@/interfaces/game.interface';

export function GenerateWord(language: IGameLanguages, requestedWord: number) {
  const words: string[] = require(`../words/${language}.json`).words;
  const length = words.length;
  const selectedWords: string[] = [];
  if (requestedWord > length) throw new RangeError('GenerateWord: more elements taken than available');
  while (requestedWord--) {
    const selected = Math.floor(Math.random() * length);
    if (!selectedWords.includes(words[selected])) {
      selectedWords.push(words[selected]);
    } else {
      requestedWord++;
    }
  }
  return selectedWords;
}
