import englishWords from '../words/en.json';

export const generateEnglishWords = () => {
  const array = englishWords.words;
  return array.sort(() => Math.random() - Math.random()).slice(0, 350);
};
