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
  private readonly defaultFolder = 'general';
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureDirectory(this.uploadDir);
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: FileUploadOptions,
  ): Promise<UploadResult> {
    const folder = options?.folder || this.defaultFolder;
    const folderPath = this.getUploadPath(folder);

    this.ensureDirectory(folderPath);

    const filename = this.createFileName(file.originalname);
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
    const fullPath = this.getUploadPath(folderPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }

  private getUploadPath(folder: string): string {
    return path.join(this.uploadDir, folder);
  }

  private ensureDirectory(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private createFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const ext = path.extname(originalName);

    return `${timestamp}-${randomStr}${ext}`;
  }
}
