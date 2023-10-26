export interface IUser {
  id: string;
  email: string;
  username: string;
  rank: number;
  admin: IUserAdmin;
}

export interface IUserAdmin {
  id: string;
  isAdmin: boolean;
}
