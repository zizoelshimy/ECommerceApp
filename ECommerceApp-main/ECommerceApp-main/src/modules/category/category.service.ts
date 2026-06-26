import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto, updateCategoryDto } from './dto/category.dto';
import { UserDocument } from 'src/DB/models';
import { CategoryRepository } from 'src/DB/Repository';
import { LocalFileUploadService } from 'src/common/service/localFileUpload.service';
import { Types } from 'mongoose';
import { generateSlug } from 'src/common/utils/slug';
@Injectable()
export class CategoryService {
  constructor(
    private readonly _categoryRepository: CategoryRepository,
    private readonly _fileUploadService: LocalFileUploadService,
  ) {}

  async createCategory(
    body: CreateCategoryDto,
    user: UserDocument,
    file?: Express.Multer.File,
  ) {
    const { name } = body;
    const categoryExist = await this._categoryRepository.findOne({
      name: name.toLowerCase(),
    });
    if (categoryExist) {
      throw new BadRequestException('Category already exists');
    }
    let dummyData = {
      name,
      userId: user._id,
    };
    const customId = Math.random().toString(36).substring(2, 7);
    if (file) {
      const { url, path } = await this._fileUploadService.uploadFile(file, {
        folder: `category/${customId}`,
      });
      dummyData['image'] = { url, path };
      dummyData['customId'] = customId;
    }

    const category = await this._categoryRepository.create(dummyData);
    return {
      success: true,
      message: 'Category created successfully',
      category,
    };
  }

  async updateCategory(
    body: updateCategoryDto,
    user: UserDocument,
    id: Types.ObjectId,
    file?: Express.Multer.File,
  ) {
    const category = await this._categoryRepository.findOne({
      _id: id,
      userId: user._id,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (body?.name) {
      if (
        await this._categoryRepository.findOne({
          name: body.name.toLowerCase(),
        })
      ) {
        throw new BadRequestException('Category exists');
      }
      category.name = body.name;
      category.slug = generateSlug(body.name);
    }

    if (file) {
      await this._fileUploadService.deleteFile(category.image['path']);
      const { url, path } = await this._fileUploadService.uploadFile(file, {
        folder: `category/${category.customId}`,
      });
      category.image = { url, path };
    }

    await category.save();
    return {
      success: true,
      message: 'Category updated successfully',
      category,
    };
  }
  async deleteCategory(
    user: UserDocument,
    file: Express.Multer.File,
    id: Types.ObjectId,
  ) {
    const category = await this._categoryRepository.findOneAndDelete({
      _id: id,
      userId: user._id,
    });
    if (!category) {
      throw new BadRequestException(
        'Category not found or you are not authorized',
      );
    }

    if (category.image) {
      await this._fileUploadService.deleteFolder(
        `category/${category.customId}`,
      );
    }
    return { message: 'Category deleted successfully', success: true };
  }
}
