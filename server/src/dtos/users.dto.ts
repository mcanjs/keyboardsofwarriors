import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsMongoId } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(12)
  public username: string;
  // win, lose, rank, queueBan
}

export class CheckUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}

export class CheckUserEmailDto {
  @IsEmail()
  public email: string;
}

export class CheckUserResetPasswordDto {
  @IsString()
  public passwordResetToken: string;

  @IsMongoId()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}
