import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    description: 'The ID of the product to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The quantity of stock to add',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Reason or note for the stock addition',
    example: 'Received from supplier ABC - Invoice #1234',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  note?: string;
}
