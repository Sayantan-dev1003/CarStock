import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RemindersService } from './reminders.service';

@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    @Post('process')
    @ApiOperation({
        summary:
            'Manually trigger the reminder processing job. Useful for testing without waiting for the 10 PM cron.',
    })
    async processReminders() {
        return this.remindersService.processAllDueReminders();
    }

    @Get('history')
    @ApiOperation({
        summary: 'Get history of all service reminders sent to customers',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getHistory(
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    ) {
        return this.remindersService.getRemindersHistory(page, limit);
    }

    @Post('customer/:customerId')
    @ApiOperation({
        summary:
            'Manually send a service reminder to a specific customer based on their most recent eligible purchase',
    })
    @ApiParam({ name: 'customerId', type: String })
    async triggerManual(@Param('customerId') customerId: string) {
        return this.remindersService.triggerManualReminder(customerId);
    }

    @Get('due')
    @ApiOperation({
        summary:
            'Preview which customers will receive reminders when the cron runs. Use for verification.',
    })
    async getDue() {
        return this.remindersService.getDueReminders();
    }
}
