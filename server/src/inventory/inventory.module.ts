import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { GatewaysModule } from '../gateways/gateways.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [GatewaysModule, EmailModule, WhatsAppModule, NotificationsModule],
    controllers: [InventoryController],
    providers: [InventoryService],
    exports: [InventoryService], // exported for BillingModule → checkAndAlertLowStock()
})
export class InventoryModule { }
