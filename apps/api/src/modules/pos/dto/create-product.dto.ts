import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  sku!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  cost_price!: number;

  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
