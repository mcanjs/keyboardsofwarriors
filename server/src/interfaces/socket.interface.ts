import { IMatcherLanguages } from './matcher.interface';

export interface ISocketQueueStart {
  activeLangauge: IMatcherLanguages;
}

export interface ISocketQueueLeave {
  activeLanguage: IMatcherLanguages;
}

export interface ISocketUser {
  id?: string;
  email?: string;
  win?: number;
  lose?: number;
  rank?: number;
  queueBan?: string;
  username?: string;
}
