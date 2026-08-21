import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  position!: string;

  @IsNotEmpty()
  @IsNumber()
  salary!: number;
}
