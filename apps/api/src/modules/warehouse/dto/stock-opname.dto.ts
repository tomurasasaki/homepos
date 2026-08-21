import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class StockOpnameDto {
  @IsNotEmpty()
  @IsString()
  branch_id!: string;

  @IsNotEmpty()
  @IsString()
  product_id!: string;

  @IsNotEmpty()
  @IsNumber()
  actual_quantity!: number;
}
