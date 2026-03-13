import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService
      .get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService
      .get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService
      .get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error(
        'Cloudinary credentials missing in .env'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.logger.log(
      'Cloudinary initialized for cloud: ' 
      + cloudName
    );
  }

  private uploadBuffer(
    buffer: Buffer,
    options: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader
        .upload_stream(
          {
            ...options,
            resource_type: 'raw',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      uploadStream.end(buffer);
    });
  }

  async uploadPdf(
    buffer: Buffer,
    fileName: string
  ): Promise<string> {
    try {
      const result = await this.uploadBuffer(
        buffer,
        {
          folder: 'carstock/bills',
          public_id: fileName,
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          format: 'pdf',
          overwrite: true,
          invalidate: true,
          use_filename: true,
          unique_filename: false,
        }
      );
      this.logger.log(
        'PDF uploaded to Cloudinary as PDF format: '
        + result.public_id
        + ' URL: ' + result.secure_url
      );
      
      const url = result.secure_url;
      const pdfUrl = url.endsWith('.pdf') 
        ? url 
        : url + '.pdf';

      return pdfUrl;
    } catch (error) {
      this.logger.error(
        'PDF upload failed: ' + error.message
      );
      throw error;
    }
  }

  async uploadImage(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const result = await this.uploadBuffer(buffer, {
      folder: 'carstock/products',
      public_id: `${Date.now()}-${fileName.split('.')[0]}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });

    this.logger.log(`Image uploaded to Cloudinary: ${result.public_id}`);
    return result.secure_url;
  }

  async uploadCsv(buffer: Buffer, fileName: string): Promise<string> {
    const result = await this.uploadBuffer(buffer, {
      folder: 'carstock/imports',
      public_id: `${Date.now()}-${fileName.split('.')[0]}`,
      resource_type: 'raw',
      format: 'csv',
    });

    this.logger.log(`CSV uploaded to Cloudinary: ${result.public_id}`);
    return result.secure_url;
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });
      this.logger.log(`File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file from Cloudinary: ${publicId}`);
    }
  }
}
