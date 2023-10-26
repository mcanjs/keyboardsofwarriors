import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';

import { AuthService } from '@services/auth.service';
import { PrismaClient, User } from '@prisma/client';
import { UserService } from '@/services/users.service';
import { HttpException } from '@/exceptions/httpException';
import crypto from 'crypto';
import { NODE_ENV, ORIGIN } from '@/config';
import Email from '@/utils/email';

export class AuthController {
  public auth = Container.get(AuthService);
  public user = Container.get(UserService);
  public prisma = new PrismaClient();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
      const resetToken = crypto.randomBytes(32).toString('hex');
      const verificationCodeToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const signUpUserData: User = await this.auth.signup(userData, verificationCodeToken);

      try {
        const url = `${NODE_ENV === 'production' ? ORIGIN : 'http://localhost:3000'}/verification/${resetToken}/${signUpUserData.id}`;
        await new Email(userData, url).sendVerificationUrl();

        res.status(200).json({
          status: 'success',
          message: 'You will receive a verification email',
        });
      } catch (err: any) {
        console.log(err);
        throw new HttpException(500, 'There was an error sending email');
      }
    } catch (error) {
      console.log('error >>', error);
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
      const { cookie, user } = await this.auth.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        data: user,
        message: 'login',
        cookie,
      });
    } catch (error) {
      next(error);
    }
  };

  public verify = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        message: 'verify',
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.auth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = await this.user.findUserByEmail(req.body.email);

      if (!userData.isVerified) throw new HttpException(409, "User doesn't verified");

      if (userData.provider) {
        throw new HttpException(
          409,
          'We found your account. It looks like you registered with a social auth account. Try signing in with social auth.',
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      await this.user.updateUserPasswordReset(userData.id, { passwordResetToken, passwordResetAt: new Date(Date.now() + 10 * 60 * 1000) });

      try {
        const url = `${NODE_ENV === 'production' ? ORIGIN : 'http://localhost:3000'}/reset-password/${resetToken}`;
        await new Email(userData, url).sendPasswordResetToken();

        res.status(200).json({
          status: 'success',
          message: 'You will receive a reset email if user with that email exist',
        });
      } catch (err: any) {
        await this.user.updateUserPasswordReset(userData.id, { passwordResetToken: null, passwordResetAt: null });
        console.log(err);
        throw new HttpException(500, 'There was an error sending email');
      }
    } catch (error) {
      console.log('Forgot Password error : ', error);
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const passwordResetToken = crypto.createHash('sha256').update(req.body.passwordResetToken).digest('hex');
      const user = await this.prisma.user.findFirst({
        where: {
          passwordResetToken,
          passwordResetAt: {
            gt: new Date(),
          },
        },
      });

      if (user) {
        await this.user.updateUserPassword(req.body.userId, req.body.password);

        res.status(200).json({
          message: 'Password data updated successfully',
        });
      } else {
        throw new HttpException(409, 'Token expired, try again');
      }
    } catch (err: any) {
      next(err);
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, userId } = req.body;
      const verificationToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          verificationCode: verificationToken,
          isVerified: false,
        },
      });

      if (user) {
        await this.user.updateUserVerification(req.body.userId);

        res.status(200).json({
          message: 'Your sign up successfully',
        });
      } else {
        throw new HttpException(409, 'User not found');
      }
    } catch (error) {
      next(error);
    }
  };
}
