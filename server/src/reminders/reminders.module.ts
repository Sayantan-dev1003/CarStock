import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersScheduler } from './reminders.scheduler';
import { RemindersController } from './reminders.controller';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [EmailModule, WhatsAppModule, PrismaModule],
    controllers: [RemindersController],
    providers: [RemindersService, RemindersScheduler],
    exports: [RemindersService],
})
export class RemindersModule { }
