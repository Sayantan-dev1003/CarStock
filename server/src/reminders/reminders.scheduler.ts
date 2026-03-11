import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersScheduler {
    private readonly logger = new Logger(RemindersScheduler.name);

    constructor(private readonly remindersService: RemindersService) { }

    @Cron('0 22 * * *', {
        name: 'service-reminders',
        timeZone: 'Asia/Kolkata',
    })
    async processReminders(): Promise<void> {
        this.logger.log(`Service reminder cron triggered at ${new Date().toISOString()}`);

        try {
            const result = await this.remindersService.processAllDueReminders();
            this.logger.log(`Service reminder cron completed: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error(`Service reminder cron failed: ${error.message}`);
            // Error is caught so the cron remains active for the next run
        }
    }
}
