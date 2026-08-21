import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@pos/types';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  tenant_name!: string;

  @IsNotEmpty()
  @IsString()
  subdomain!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.MANAGER;
}
