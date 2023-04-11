import { JsonValue } from 'prisma';
interface UserMatchmaking extends JsonValue {
  win: string;
  lose: string;
  rank: string;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  matchmaking: UserMatchmaking;
  queuePosition: string;
}
