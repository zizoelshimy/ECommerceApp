import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/DB/Repository/product.repository';
import { CategoryModel, ProductModel } from 'src/DB/models';
import { LocalFileUploadService } from 'src/common/service/localFileUpload.service';
import { CategoryRepository } from 'src/DB/Repository';

@Module({
  imports: [ProductModel, CategoryModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    LocalFileUploadService,
    CategoryRepository,
  ],
  exports: [],
})
export class ProductModule {}
