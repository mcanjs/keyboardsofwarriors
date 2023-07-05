export interface ISocketQueueStart {
  activeLangauge: 'en' | 'tr';
}

export interface ISocketQueueLeave {
  activeLanguage: 'en' | 'tr';
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
