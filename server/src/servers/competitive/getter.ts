import { IGameLanguages, IGameLeagues } from '@/interfaces/game.interface';

export const getGameLanguages = (): IGameLanguages[] => ['en', 'tr'];
export const getGameLeagues = (): IGameLeagues[] => ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'];
