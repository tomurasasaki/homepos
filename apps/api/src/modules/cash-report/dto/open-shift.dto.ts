import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class OpenShiftDto {
  @IsNotEmpty()
  @IsString()
  branch_id!: string;

  @IsNotEmpty()
  @IsNumber()
  start_cash!: number;
}
