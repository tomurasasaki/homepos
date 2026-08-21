import { IsNotEmpty, IsString, IsArray, IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@pos/types';

export class CheckoutItemDto {
  @IsNotEmpty()
  @IsString()
  product_id!: string;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;
}

export class CheckoutDto {
  @IsNotEmpty()
  @IsString()
  branch_id!: string;

  @IsNotEmpty()
  @IsString()
  shift_id!: string;

  @IsOptional()
  @IsString()
  member_id?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @IsNotEmpty()
  @IsNumber()
  paid_amount!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsOptional()
  @IsNumber()
  discount_amount?: number = 0;
}
