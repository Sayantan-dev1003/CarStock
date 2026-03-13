import { Module, forwardRef } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { GatewaysModule } from '../gateways/gateways.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [GatewaysModule, EmailModule, WhatsAppModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
