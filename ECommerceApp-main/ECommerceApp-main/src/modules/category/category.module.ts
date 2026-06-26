import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/DB/Repository';
import { CategoryModel } from 'src/DB/models';
import { LocalFileUploadService } from 'src/common/service/localFileUpload.service';

@Module({
  imports: [CategoryModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, LocalFileUploadService],
})
export class CategoryModule {}
