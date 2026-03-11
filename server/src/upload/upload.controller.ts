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

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

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

        const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
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

        // TODO Stage 19 — implement CSV parsing for bulk product import
        return {
            url: signedUrl,
            message:
                'CSV uploaded successfully. Import processing is not yet implemented.',
        };
    }
}
