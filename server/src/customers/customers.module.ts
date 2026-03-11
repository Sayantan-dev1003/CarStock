import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

import { RemindersModule } from '../reminders/reminders.module';

@Module({
    imports: [RemindersModule],
    controllers: [CustomersController],
    providers: [CustomersService],
    exports: [CustomersService], // exported for BillingModule
})
export class CustomersModule { }
