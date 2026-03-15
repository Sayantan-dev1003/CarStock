import { Module } from '@nestjs/common';
import { InventoryGateway } from './inventory.gateway';
import { BillsGateway } from './bills.gateway';
import { ProductsModule } from '../products/products.module';
import { RedisModule } from '../redis/redis.module';

// GatewaysModule must NOT import InventoryModule — that would create a
// circular dependency (InventoryModule → GatewaysModule → InventoryModule).
// BillingModule will import both independently.
@Module({
  imports: [ProductsModule, RedisModule],
  providers: [InventoryGateway, BillsGateway],
  exports: [InventoryGateway, BillsGateway],
})
export class GatewaysModule {}
