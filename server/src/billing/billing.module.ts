import { Module, forwardRef } from '@nestjs/common';
import { GatewaysModule } from '../gateways/gateways.module';
import { InventoryModule } from '../inventory/inventory.module';
import { BillPdfService } from './bill-pdf.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { QueuesModule } from '../queues/queues.module';
import { BullModule } from '@nestjs/bull';
import { BILL_DELIVERY_QUEUE } from '../queues/queue.constants';

import { UploadModule } from '../upload/upload.module';

// GatewaysModule  → provides InventoryGateway  (for emitBillCreated, emitStockUpdate)
// InventoryModule → provides InventoryService  (for checkAndAlertLowStock)
// Neither imports BillingModule → no circular dependency
@Module({
    imports: [
        GatewaysModule,
        InventoryModule,
        UploadModule,
        forwardRef(() => QueuesModule),
        BullModule.registerQueue({ name: BILL_DELIVERY_QUEUE }),
    ],
    controllers: [BillingController],
    providers: [BillingService, BillPdfService],
    exports: [BillingService, BillPdfService],
})
export class BillingModule { }
