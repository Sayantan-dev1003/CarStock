import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { BillItemDto } from './bill-item.dto';

export class CreateBillDto {
    @ApiProperty({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'UUID of the customer being billed',
    })
    @IsUUID()
    customerId: string;

    @ApiProperty({
        type: [BillItemDto],
        description: 'Array of items in this bill (minimum 1 item)',
        minItems: 1,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => BillItemDto)
    items: BillItemDto[];

    @ApiProperty({
        example: 'UPI',
        description: 'Payment method',
        enum: ['CASH', 'UPI', 'CARD'],
    })
    @IsIn(['CASH', 'UPI', 'CARD'])
    paymentMode: string;

    @ApiPropertyOptional({
        example: 200,
        description: 'Flat discount amount in INR (default 0)',
        minimum: 0,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @ApiPropertyOptional({
        example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        description:
            'UUID of the vehicle this purchase is linked to (optional). ' +
            'When provided, a VehiclePurchaseLog is created for service reminder tracking.',
    })
    @IsOptional()
    @IsUUID()
    vehicleId?: string;
}
