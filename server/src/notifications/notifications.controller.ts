import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @ApiOperation({
    summary:
      'Register FCM device token from admin mobile app. Call this on every app launch.',
  })
  async registerToken(
    @CurrentUser('id') adminId: string,
    @Body() registerTokenDto: RegisterTokenDto,
  ) {
    await this.notificationsService.registerToken(
      adminId,
      registerTokenDto.deviceToken,
    );
    return {
      message: 'Device token registered successfully',
    };
  }

  @Post('test-push')
  @ApiOperation({ summary: 'Send a test push notification to the registered admin device.' })
  async testPush() {
    const sent = await this.notificationsService.sendPush({
      title: '🔔 Test Notification',
      body: 'CarStock Admin notifications are working correctly!',
      data: { type: 'TEST' },
    });

    return {
      sent,
      message: sent
        ? 'Test notification sent successfully'
        : 'Failed — register device token first using POST /notifications/register-token',
    };
  }
}
