import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Arjun Mehta', description: 'Full name (min 2 chars)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @ApiProperty({
        example: '9876543210',
        description: 'Valid 10-digit Indian mobile number (starts with 6–9)',
    })
    @IsString()
    @Matches(/^[6-9]\d{9}$/, {
        message: 'Enter a valid 10-digit Indian mobile number',
    })
    mobile: string;

    @ApiProperty({ example: 'arjun.mehta@gmail.com', description: 'Email address' })
    @IsEmail()
    email: string;
}
