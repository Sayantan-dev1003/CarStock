import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('register-token')
    @ApiOperation({
        summary: 'Register FCM device token from admin mobile app. Call this on every app launch.',
    })
    async registerToken(
        @CurrentUser('sub') adminId: string,
        @Body() dto: RegisterTokenDto,
    ) {
        await this.notificationsService.registerToken(adminId, dto.deviceToken);
        return { message: 'Device token registered successfully' };
    }

    @Post('test-push')
    @ApiOperation({
        summary: 'Send a test push notification to verify the pipeline.',
    })
    async testPush() {
        const sent = await this.notificationsService.sendPush({
            title: 'Bell Test Notification',
            body: 'CarStock Admin notifications are working correctly!',
        });

        return {
            sent,
            message: sent
                ? 'Test notification sent'
                : 'Failed — check device token registration',
        };
    }
}
