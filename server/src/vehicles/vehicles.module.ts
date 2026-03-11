import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
    controllers: [VehiclesController],
    providers: [VehiclesService],
    exports: [VehiclesService], // exported for BillingModule (VehiclePurchaseLog creation)
})
export class VehiclesModule { }
