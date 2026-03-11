import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsUrl,
} from 'class-validator';

export enum ProductCategory {
  TYRES = 'TYRES',
  BATTERIES = 'BATTERIES',
  WIPERS = 'WIPERS',
  BRAKES = 'BRAKES',
  SEAT_COVERS = 'SEAT_COVERS',
  LIGHTING = 'LIGHTING',
  AUDIO = 'AUDIO',
  OILS = 'OILS',
  ELECTRICAL = 'ELECTRICAL',
  OTHER = 'OTHER',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Michelin Pilot Sport 4', description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TYR-MCH-PS4-001', description: 'Unique SKU identifier (will be uppercase)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.TYRES, description: 'Product category' })
  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'Michelin', description: 'Brand name' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 40, description: 'Current inventory quantity' })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 85.50, description: 'Cost price per unit' })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 120.00, description: 'Selling price per unit' })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({ example: 10, description: 'Reorder level alert threshold', default: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  reorderLevel?: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/tyre.png', description: 'Product image URL' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
