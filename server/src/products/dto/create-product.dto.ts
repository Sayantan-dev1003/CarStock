import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsInt,
    Min,
    IsIn,
    IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const PRODUCT_CATEGORIES = [
    'TYRES',
    'BATTERIES',
    'WIPERS',
    'BRAKES',
    'SEAT_COVERS',
    'LIGHTING',
    'AUDIO',
    'OILS',
    'ELECTRICAL',
    'OTHER',
];

export class CreateProductDto {
    @ApiProperty({ example: 'Michelin Pilot Sport 4', description: 'Name of the product' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'TYRE-MIC-PS4-17', description: 'Unique Stock Keeping Unit' })
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    sku: string;

    @ApiProperty({
        example: 'TYRES',
        enum: PRODUCT_CATEGORIES,
    })
    @IsString()
    @IsIn(PRODUCT_CATEGORIES)
    category: string;

    @ApiPropertyOptional({ example: 'Michelin' })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiProperty({ example: 50, minimum: 0 })
    @IsInt()
    @Min(0)
    quantity: number;

    @ApiProperty({ example: 4500, minimum: 0 })
    @IsNumber()
    @Min(0)
    costPrice: number;

    @ApiProperty({ example: 5500, minimum: 0 })
    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @ApiPropertyOptional({ example: 10, minimum: 1, default: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    reorderLevel?: number;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
    @IsOptional()
    @IsString()
    @IsUrl()
    imageUrl?: string;
}
