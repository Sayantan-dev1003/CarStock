import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ProductsService } from '../products/products.service';
import { parse } from 'csv-parse/sync';

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly productsService: ProductsService,
    ) { }

    @Post('product-image')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('image'))
    async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Only JPEG, PNG and WebP images are allowed',
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('Image must be less than 5MB');
        }

        const signedUrl = await this.uploadService.uploadImage(
            file.buffer,
            file.originalname,
            file.mimetype,
        );

        return { url: signedUrl };
    }

    @Post('csv')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadCsv(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('CSV file is required');
        }

        const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/octet-stream'];
        if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.endsWith('.csv')) {
            throw new BadRequestException('Only CSV files are allowed');
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException('CSV must be less than 10MB');
        }

        const signedUrl = await this.uploadService.uploadCsv(
            file.buffer,
            file.originalname,
        );

        const csvString = file.buffer.toString('utf-8');
        let records: any[] = [];
        try {
            records = parse(csvString, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
        } catch (error) {
            throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
        }

        let successCount = 0;
        const failedRows: { row: number; sku: string; error: string }[] = [];

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNumber = i + 1;
            const sku = row.sku || row.SKU || '';
            const name = row.name || row.Name || '';
            const category = row.category || row.Category || '';
            const brand = row.brand || row.Brand || '';
            const quantity = parseInt(row.quantity || row.Quantity || '0', 10);
            const costPrice = parseFloat(row.costPrice || row.CostPrice || '0');
            const sellingPrice = parseFloat(row.sellingPrice || row.SellingPrice || '0');
            const reorderLevel = parseInt(row.reorderLevel || row.ReorderLevel || '5', 10);
            const imageUrl = row.imageUrl || row.ImageUrl || null;

            if (!name || !sku || !category || !brand) {
                failedRows.push({ 
                    row: rowNumber, 
                    sku: String(sku), 
                    error: 'Missing required fields (name, sku, category, brand)' 
                });
                continue;
            }

            try {
                await this.productsService.create({
                    name,
                    sku: String(sku).toUpperCase(),
                    category,
                    brand,
                    quantity,
                    costPrice,
                    sellingPrice,
                    reorderLevel,
                    imageUrl,
                });
                successCount++;
            } catch (error) {
                failedRows.push({ 
                    row: rowNumber, 
                    sku: String(sku), 
                    error: error.message || 'Unknown error' 
                });
            }
        }

        return {
            url: signedUrl,
            message: 'CSV processed',
            summary: {
                totalRows: records.length,
                successCount,
                failedCount: failedRows.length,
            },
            failedRows: failedRows.length > 0 ? failedRows : undefined,
        };
    }
}
