import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export type CustomerTag = 'REGULAR' | 'VIP' | 'INACTIVE';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
    @ApiPropertyOptional({
        example: 'VIP',
        description: 'Customer segment tag',
        enum: ['REGULAR', 'VIP', 'INACTIVE'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['REGULAR', 'VIP', 'INACTIVE'])
    tag?: CustomerTag;
}
