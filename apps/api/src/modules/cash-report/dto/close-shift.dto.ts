import { IsNotEmpty, IsNumber } from 'class-validator';

export class CloseShiftDto {
  @IsNotEmpty()
  @IsNumber()
  actual_cash!: number;
}
