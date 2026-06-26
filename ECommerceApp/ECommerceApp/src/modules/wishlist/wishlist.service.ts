import { BadRequestException, Injectable } from '@nestjs/common';
import { WishlistRepository } from 'src/DB/Repository/wishlist.repository';
import { ProductRepository } from 'src/DB/Repository';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { UserDocument, WishlistDocument } from 'src/DB/models';
import { Types } from 'mongoose';

@Injectable()
export class WishlistService {
  constructor(
    private readonly _wishlistRepository: WishlistRepository,
    private readonly _productRepository: ProductRepository,
  ) {}

  async addToWishlist(body: AddToWishlistDto, user: UserDocument) {
    const { productId } = body;

    const product = await this._productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    let wishlist = await this.findUserWishlist(user);

    if (!wishlist) {
      wishlist = await this._wishlistRepository.create({
        userId: user._id,
        products: [productId],
      });
    } else {
      if (this.hasProduct(wishlist, productId)) {
        throw new BadRequestException('Product already in wishlist');
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    return {
      message: 'Product added to your wishlist successfully',
      success: true,
      wishlist,
    };
  }

  async removeFromWishlist(user: UserDocument, productId: Types.ObjectId) {
    const wishlist = await this.findUserWishlist(user);

    if (!wishlist) {
      throw new BadRequestException('Wishlist not found');
    }

    const productIndex = this.findProductIndex(wishlist, productId);

    if (productIndex === -1) {
      throw new BadRequestException('Product not in wishlist');
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    return {
      message: 'Product removed from your wishlist successfully',
      success: true,
      wishlist,
    };
  }

  async getWishlist(user: UserDocument) {
    const wishlist = await this._wishlistRepository.findOne(
      { userId: user._id },
      [{ path: 'products' }],
    );

    if (!wishlist) {
      return { success: true, message: 'Your wishlist is empty', products: [] };
    }

    return {
      success: true,
      message: 'Wishlist fetched successfully',
      products: wishlist.products,
    };
  }

  async clearWishlist(user: UserDocument) {
    const wishlist = await this.findUserWishlist(user);

    if (!wishlist) {
      throw new BadRequestException('Wishlist not found');
    }

    wishlist.products = [];
    await wishlist.save();

    return {
      message: 'Your wishlist has been cleared successfully',
      success: true,
    };
  }

  private findUserWishlist(user: UserDocument) {
    return this._wishlistRepository.findOne({ userId: user._id });
  }

  private hasProduct(
    wishlist: WishlistDocument,
    productId: Types.ObjectId,
  ): boolean {
    return this.findProductIndex(wishlist, productId) !== -1;
  }

  private findProductIndex(
    wishlist: WishlistDocument,
    productId: Types.ObjectId,
  ): number {
    return wishlist.products.findIndex((id) =>
      this.isSameProduct(id, productId),
    );
  }

  private isSameProduct(
    currentProductId: Types.ObjectId,
    targetProductId: Types.ObjectId,
  ): boolean {
    return currentProductId.toString() === targetProductId.toString();
  }
}
