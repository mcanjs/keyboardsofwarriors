import { Admin, Premium } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  username: string;
  win: number;
  lose: number;
  rank: number;
  password: string;
  queueBan: string;
  premium: Premium;
  premiumId: string;
  admin: Admin;
  adminId: string;
}
