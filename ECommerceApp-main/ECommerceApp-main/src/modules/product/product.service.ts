import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  QueryDto,
  updateProductDto,
} from './dto/product.dto';
import { ProductDocument, UserDocument } from 'src/DB/models';
import { ProductRepository } from 'src/DB/Repository/product.repository';
import { LocalFileUploadService } from 'src/common/service/localFileUpload.service';
import { CategoryRepository } from 'src/DB/Repository';
import { FilterQuery, Types } from 'mongoose';
import { generateSlug } from 'src/common/utils/slug';

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _fileUploadService: LocalFileUploadService,
    private readonly _categoryRepository: CategoryRepository,
  ) {}

  async createProduct(
    body: CreateProductDto,
    user: UserDocument,
    files: {
      mainImage: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
  ) {
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      price,
      discount,
      stock,
      quantity,
    } = body;

    const categoryExist = await this._categoryRepository.findOne({
      _id: category,
    });
    if (!categoryExist) {
      throw new BadRequestException('Category not found');
    }

    if (!files.mainImage) {
      throw new BadRequestException('Main image is required');
    }
    const customId = Math.random().toString(36).substring(2, 7);

    const { url, path } = await this._fileUploadService.uploadFile(
      files.mainImage[0],
      { folder: `product/${customId}/mainImage` },
    );

    let subImages: { url: string; path: string }[] = [];
    if (files.subImages) {
      const results = await this._fileUploadService.uploadMultipleFiles(
        files.subImages,
        { folder: `product/${customId}/subImages` },
      );
      subImages.push(...results);
    }

    const subPrice = price - price * ((discount || 0) / 100);

    const product = await this._productRepository.create({
      name,
      description,
      category: Types.ObjectId.createFromHexString(category),
      subCategory: Types.ObjectId.createFromHexString(subCategory),
      brand: Types.ObjectId.createFromHexString(brand),
      price,
      discount,
      subPrice,
      stock,
      quantity,
      customId,
      mainImage: { url, path },
      subImages,
      userId: user._id,
    });

    return { success: true, message: 'Product created successfully', product };
  }

  async updateProduct(
    body: updateProductDto,
    user: UserDocument,
    productId: Types.ObjectId,
    files: {
      mainImage: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
  ) {
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      price,
      discount,
      stock,
      quantity,
    } = body;
    const product = await this._productRepository.findOne({
      _id: productId,
      userId: user._id,
    });
    if (!product) {
      throw new BadRequestException(
        'Product not found or you are not authorized',
      );
    }

    if (name) {
      product.name = name;
      product.slug = generateSlug(name);
    }

    if (description) {
      product.description = description;
    }

    const categoryExist = await this._categoryRepository.findOne({
      _id: category,
    });
    if (!categoryExist) {
      throw new BadRequestException(
        'Category not found or you are not authorized',
      );
    }

    if (files.mainImage) {
      await this._fileUploadService.deleteFile(product.mainImage['path']);
      const { url, path } = await this._fileUploadService.uploadFile(
        files.mainImage[0],
        { folder: `product/${product.customId}/mainImage` },
      );
      product.mainImage = { url, path };
    }

    if (files.subImages) {
      await this._fileUploadService.deleteFolder(
        `product/${product.customId}/subImages`,
      );
      const results = await this._fileUploadService.uploadMultipleFiles(
        files.subImages,
        { folder: `product/${product.customId}/subImages` },
      );
      product.subImages = results;
    }

    if (price && discount) {
      product.subPrice = price - price * (discount / 100);
      product.price = price;
      product.discount = discount;
    } else if (price) {
      product.subPrice = price - price * (product.discount / 100);
      product.price = price;
    } else if (discount) {
      product.subPrice = product.price - product.price * (discount / 100);
      product.discount = discount;
    }

    if (stock) {
      if (stock > product.quantity) {
        throw new BadRequestException('Stock cannot be less than quantity');
      }
      product.stock = stock;
    }

    if (quantity) {
      product.quantity = quantity;
    }

    await product.save();

    return { success: true, message: 'Product updated successfully', product };
  }

  async getProducts(query: QueryDto) {
    let filterObj: FilterQuery<ProductDocument> = {};

    if (query?.name) {
      filterObj = {
        $or: [
          { name: { $regex: query.name, $options: 'i' } },
          { slug: { $regex: query.name, $options: 'i' } },
        ],
      };
    }

    const products = await this._productRepository.find({
      filter: filterObj,
      populate: [{ path: 'category' }],
      select: query.select,
      sort: query.sort,
      page: query.page,
    });

    return {
      success: true,
      message: 'Products fetched successfully',
      products,
    };
  }
}
