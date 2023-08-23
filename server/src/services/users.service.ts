import { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/httpException';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.user.findMany();
    return allUser;
  }

  public async findUserByEmail(userEmail: string): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { email: userEmail } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        queueBan: '',
        premium: {
          create: {
            isPremium: false,
          },
        },
        admin: {
          create: {
            isAdmin: false,
          },
        },
      },
    });
    return createUserData;
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    const updateUserData = await this.user.update({ where: { id: userId }, data: { ...userData, password: hashedPassword } });
    return updateUserData;
  }

  public async updateUserPassword(userId: string, password: string): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(password, 10);
    const updateUserData = await this.user.update({
      where: { id: userId },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetAt: null },
    });
    return updateUserData;
  }

  public async updateUserPasswordReset(
    userId: string,
    { passwordResetToken, passwordResetAt }: { passwordResetToken: string; passwordResetAt: Date },
  ): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const updateUserData = await this.user.update({ where: { id: userId }, data: { passwordResetToken, passwordResetAt } });
    return updateUserData;
  }

  public async deleteUser(userId: string): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await this.user.delete({ where: { id: userId } });
    return deleteUserData;
  }
}
