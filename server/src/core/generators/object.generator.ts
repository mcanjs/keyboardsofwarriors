import { IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { ISocketUser } from '@/interfaces/socket.interface';

export const generateMatcherRoomUserObject = (user: ISocketUser, socketId: string): IMatcherRoomUser => {
  return {
    email: user.email,
    username: user.username,
    socketId,
  };
};
