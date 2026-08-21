import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStockTransferDto {
  @IsNotEmpty()
  @IsString()
  from_branch_id!: string;

  @IsNotEmpty()
  @IsString()
  to_branch_id!: string;

  @IsNotEmpty()
  @IsString()
  product_id!: string;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
