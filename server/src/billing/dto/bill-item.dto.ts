import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class BillItemDto {
    @ApiProperty({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'UUID of the product being sold',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 2, description: 'Number of units sold (min 1)', minimum: 1 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({
        example: 3500.0,
        description:
            'Unit price at time of sale. Sent by frontend — admin may apply custom price.',
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    unitPrice: number;
}
