import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BillItemDto } from './bill-item.dto';

export class CreateBillDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [BillItemDto], description: 'List of items in the bill', minItems: 1 })
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  @ArrayMinSize(1)
  items: BillItemDto[];

  @ApiProperty({ example: 'CASH', description: 'Mode of payment', enum: ['CASH', 'UPI', 'CARD'] })
  @IsString()
  @IsIn(['CASH', 'UPI', 'CARD'])
  paymentMode: string;

  @ApiPropertyOptional({ example: 'PAID', description: 'Bill status', enum: ['PAID', 'PENDING'], default: 'PAID' })
  @IsOptional()
  @IsString()
  @IsIn(['PAID', 'PENDING'])
  status?: string;

  @ApiPropertyOptional({ example: 100, description: 'Discount applied to the bill', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Vehicle ID (optional)' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
