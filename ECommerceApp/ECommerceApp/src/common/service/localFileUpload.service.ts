import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface FileUploadOptions {
  folder?: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

@Injectable()
export class LocalFileUploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<UploadResult> {
    const folder = options?.folder || 'general';
    const folderPath = path.join(this.uploadDir, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(folderPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      url: `/uploads/${folder}/${filename}`,
      path: filepath,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options?: FileUploadOptions,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filepath: string): Promise<void> {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, folderPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}
