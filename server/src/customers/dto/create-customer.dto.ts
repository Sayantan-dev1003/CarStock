import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the customer' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '9876543210', description: 'The mobile number of the customer' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email address of the customer' })
  @IsEmail()
  email: string;
}
