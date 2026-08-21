import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsNumber()
  discount_amount!: number;
}
