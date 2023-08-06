export interface ISocketQueueStart {
  activeLangauge: "en" | "tr";
}

export interface ICompetitiveIncorrectLetter {
  [key: string]: ICompetitiveIncorrectDetail[];
}

export interface ICompetitiveIncorrectDetail {
  expectedLetter: string;
  writtenLetter: string;
  letterIndex: number;
}

export interface ICompetitiveGameInformations {
  words: string[];
  timeouts: ICompetitiveGameInformationsTimeouts;
}

export interface ICompetitiveGameInformationsTimeouts {
  startCountdown: number;
  finish: number;
}
