import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTokenDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @ApiProperty({
        example: 'ExponentPushToken[xxxxxxxxxxxxxx]',
        description: 'FCM or Expo push token from the admin mobile device',
    })
    deviceToken: string;
}
