import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { CheckUserDto, CheckUserEmailDto, CheckUserResetPasswordDto, CheckUserVerifyEmailDto, CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, ValidationMiddleware(CreateUserDto, 'body'), this.auth.signUp);
    this.router.post(`${this.path}login`, ValidationMiddleware(CheckUserDto, 'body'), this.auth.logIn);
    this.router.post(`${this.path}verify`, AuthMiddleware, this.auth.verify);
    this.router.post(`${this.path}forgot-password`, ValidationMiddleware(CheckUserEmailDto, 'body'), this.auth.forgotPassword);
    this.router.post(`${this.path}verify-email`, ValidationMiddleware(CheckUserVerifyEmailDto, 'body'), this.auth.verifyEmail);
    this.router.post(`${this.path}reset-password`, ValidationMiddleware(CheckUserResetPasswordDto, 'body'), this.auth.resetPassword);
    this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
  }
}
