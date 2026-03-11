import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'admin@carstock.com',
        description: 'Registered admin email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'Admin@123',
        description: 'Account password (minimum 6 characters)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
