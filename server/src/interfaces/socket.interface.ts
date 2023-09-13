import { Namespace } from 'socket.io';
import { IGameLanguages } from './game.interface';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface ISocketNamespaces {
  competitive: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | undefined;
}

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

export interface ISocketQueueList {
  [key: string]: ISocketQueueListData;
}

export interface ISocketQueueListData {
  activeQueue: ISocketQueueListActiveQueue | undefined;
}

export interface ISocketQueueListActiveQueue {
  queueLanguage: IGameLanguages;
  rank: number;
  roomId: string;
}
