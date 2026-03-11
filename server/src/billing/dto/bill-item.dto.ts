import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class BillItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity of product' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1500, description: 'Unit price of product' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}
