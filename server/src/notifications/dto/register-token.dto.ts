import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxx]',
    description: 'FCM or Expo push token from the admin mobile device',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  deviceToken: string;
}
