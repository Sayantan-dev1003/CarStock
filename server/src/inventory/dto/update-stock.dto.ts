import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateStockDto {
    @ApiProperty({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'UUID of the product to restock',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({
        example: 50,
        description: 'Number of units to add (minimum 1)',
        minimum: 1,
    })
    @IsInt()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @ApiPropertyOptional({
        example: 'Received from supplier ABC - Invoice #1234',
        description: 'Reason / note for this stock addition (max 200 chars)',
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    note?: string;
}
