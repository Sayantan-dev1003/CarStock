import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({ example: 'VIP', description: 'Customer tag' })
  @IsOptional()
  @IsString()
  @IsIn(['REGULAR', 'VIP', 'INACTIVE'])
  tag?: string;
}
