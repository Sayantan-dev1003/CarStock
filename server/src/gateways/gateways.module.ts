import { Module } from '@nestjs/common';
import { InventoryGateway } from './inventory.gateway';

// GatewaysModule must NOT import InventoryModule — that would create a
// circular dependency (InventoryModule → GatewaysModule → InventoryModule).
// BillingModule will import both independently.
@Module({
    providers: [InventoryGateway],
    exports: [InventoryGateway],
})
export class GatewaysModule { }
