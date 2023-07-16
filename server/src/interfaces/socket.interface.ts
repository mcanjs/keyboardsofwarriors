import { IGameLanguages } from './game.interface';

export interface ISocketQueueStart {
  activeLangauge: IGameLanguages;
}

export interface ISocketQueueLeave {
  activeLanguage: IGameLanguages;
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
