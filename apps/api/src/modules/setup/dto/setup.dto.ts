import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum DatabaseType {
  POSTGRESQL = 'POSTGRESQL',
  MARIADB = 'MARIADB',
  SQLITE = 'SQLITE',
}

export enum DeploymentTarget {
  LOCALHOST = 'LOCALHOST',
  VPS = 'VPS',
}

export class TestDbDto {
  @IsNotEmpty()
  @IsEnum(DatabaseType)
  db_type!: DatabaseType;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  port?: number;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  sqlite_path?: string;
}

export class CompleteSetupDto {
  // Step 1: Environment & Database
  @IsNotEmpty()
  @IsEnum(DeploymentTarget)
  deployment_target!: DeploymentTarget;

  @IsNotEmpty()
  @IsEnum(DatabaseType)
  db_type!: DatabaseType;

  @IsOptional()
  @IsString()
  db_host?: string;

  @IsOptional()
  db_port?: number;

  @IsOptional()
  @IsString()
  db_name?: string;

  @IsOptional()
  @IsString()
  db_user?: string;

  @IsOptional()
  @IsString()
  db_password?: string;

  @IsOptional()
  @IsString()
  sqlite_path?: string;

  // Step 2: Store Profile & SuperAdmin
  @IsNotEmpty()
  @IsString()
  store_name!: string;

  @IsOptional()
  @IsString()
  slogan?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsNotEmpty()
  @IsString()
  admin_name!: string;

  @IsNotEmpty()
  @IsEmail()
  admin_email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  admin_password!: string;
}
