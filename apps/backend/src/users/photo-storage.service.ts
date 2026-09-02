import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

export interface StoredPhotoResult {
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

@Injectable()
export class PhotoStorageService {
  private readonly logger = new Logger(PhotoStorageService.name);
  private gridFSBucket: GridFSBucket | null = null;
  // In-memory buffer fallback for environments without active MongoDB replica/GridFS
  private inMemoryPhotos = new Map<string, { buffer: Buffer; mimeType: string; filename: string }>();

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.initBucket();
  }

  private initBucket() {
    try {
      if (this.connection && this.connection.db) {
        this.gridFSBucket = new GridFSBucket(this.connection.db as any, {
          bucketName: 'profile_photos',
        });
        this.logger.log('📦 GridFS Bucket [profile_photos] initialized successfully.');
      }
    } catch (err: any) {
      this.logger.warn(`GridFS initialization warning: ${err.message}. Fallback cache will be used if disconnected.`);
    }
  }

  private getBucket(): GridFSBucket | null {
    if (!this.gridFSBucket && this.connection && this.connection.db) {
      this.initBucket();
    }
    return this.gridFSBucket;
  }

  async storeProfilePhoto(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredPhotoResult> {
    // 1. Validation: MIME Type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new BadRequestException('Invalid photo format. Only JPEG, PNG, and WebP are allowed.');
    }

    // 2. Validation: File Size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      throw new BadRequestException('Photo size exceeds 5MB limit.');
    }

    const bucket = this.getBucket();
    const cleanFilename = `profile_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (bucket) {
      try {
        return await new Promise<StoredPhotoResult>((resolve, reject) => {
          const uploadStream = bucket.openUploadStream(cleanFilename, {
            contentType: mimeType,
            metadata: { uploadedAt: new Date() },
          });

          const readableStream = new Readable();
          readableStream.push(fileBuffer);
          readableStream.push(null);

          readableStream
            .pipe(uploadStream)
            .on('error', (err) => {
              this.logger.error(`GridFS upload error: ${err.message}`);
              // Store in in-memory map as resilience fallback
              const fallbackId = `photo-${Date.now()}`;
              this.inMemoryPhotos.set(fallbackId, { buffer: fileBuffer, mimeType, filename: cleanFilename });
              resolve({
                fileId: fallbackId,
                url: `/api/users/photo/${fallbackId}`,
                mimeType,
                size: fileBuffer.length,
                uploadedAt: new Date(),
              });
            })
            .on('finish', () => {
              const fileId = uploadStream.id.toString();
              // Also keep in local cache for ultra-fast serving
              this.inMemoryPhotos.set(fileId, { buffer: fileBuffer, mimeType, filename: cleanFilename });
              resolve({
                fileId,
                url: `/api/users/photo/${fileId}`,
                mimeType,
                size: fileBuffer.length,
                uploadedAt: new Date(),
              });
            });
        });
      } catch (err: any) {
        this.logger.warn(`GridFS storage failed, using memory cache: ${err.message}`);
      }
    }

    // Resilient fallback storage
    const fallbackId = `photo-${Date.now()}`;
    this.inMemoryPhotos.set(fallbackId, { buffer: fileBuffer, mimeType, filename: cleanFilename });
    return {
      fileId: fallbackId,
      url: `/api/users/photo/${fallbackId}`,
      mimeType,
      size: fileBuffer.length,
      uploadedAt: new Date(),
    };
  }

  async getPhotoStream(
    fileId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; mimeType: string }> {
    // Check in-memory cache first
    if (this.inMemoryPhotos.has(fileId)) {
      const item = this.inMemoryPhotos.get(fileId)!;
      const stream = new Readable();
      stream.push(item.buffer);
      stream.push(null);
      return { stream, mimeType: item.mimeType };
    }

    const bucket = this.getBucket();
    if (bucket && ObjectId.isValid(fileId)) {
      try {
        const objId = new ObjectId(fileId);
        const files = await this.connection.db
          ?.collection('profile_photos.files')
          .find({ _id: objId })
          .toArray();

        if (files && files.length > 0) {
          const fileDoc = files[0];
          const mimeType = fileDoc.contentType || 'image/jpeg';
          const downloadStream = bucket.openDownloadStream(objId);
          return { stream: downloadStream, mimeType };
        }
      } catch (err: any) {
        this.logger.warn(`GridFS download failed for ${fileId}: ${err.message}`);
      }
    }

    throw new NotFoundException('Profile photo not found.');
  }

  // Pre-seed demo placeholder photo
  seedDemoPhoto(id: string, base64Svg: string, mimeType = 'image/svg+xml') {
    const buffer = Buffer.from(base64Svg, 'utf-8');
    this.inMemoryPhotos.set(id, { buffer, mimeType, filename: `demo_${id}.svg` });
  }
}
