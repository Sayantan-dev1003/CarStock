import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        MulterModule.register({
            storage: memoryStorage(),
        }),
        ProductsModule,
    ],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule { }
