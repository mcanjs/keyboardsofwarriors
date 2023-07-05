import { IMatcherLanguages, IMatcherLeagues } from '@/interfaces/matcher.interface';

export const getMatcherLanguages = (): IMatcherLanguages[] => ['en', 'tr'];
export const getMatcherLeagues = (): IMatcherLeagues[] => ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'];
