import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/cart.dto';
import { ProductDocument, UserDocument } from 'src/DB/models';
import { CartRepository, ProductRepository } from 'src/DB/Repository';
import { Types } from 'mongoose';

type CartProduct = {
  productId: Types.ObjectId;
  quantity: number;
  finalPrice: number;
};

@Injectable()
export class CartService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async createCart(body: CreateCartDto, user: UserDocument) {
    const { productId, quantity } = body;

    const product = await this.getAvailableProduct(productId, quantity);

    const cart = await this.cartRepository.findOne({ userId: user._id });
    if (!cart) {
      const newCart = await this.cartRepository.create({
        userId: user._id,
        products: [this.createCartProduct(product, quantity)],
      });
      return this.cartResponse(
        'Product added to your cart successfully',
        newCart,
      );
    }
    const productExist = cart.products.find((p) =>
      this.isSameProduct(p.productId, productId),
    );
    if (productExist) {
      throw new BadRequestException('Product already exists in cart');
    }

    cart.products.push(this.createCartProduct(product, quantity));
    const updatedCart = await cart.save();
    return this.cartResponse(
      'Product added to your cart successfully',
      updatedCart,
    );
  }

  async removeFromCart(productId: string, user: UserDocument) {
    const cart = await this.cartRepository.findOne({
      userId: user._id,
      'products.productId': productId,
    });
    if (!cart) {
      throw new BadRequestException('Product not found in cart');
    }

    cart.products = cart.products.filter(
      (p) => !this.isSameProduct(p.productId, productId),
    );
    const updatedCart = await cart.save();
    return this.cartResponse(
      'Product removed from your cart successfully',
      updatedCart,
    );
  }

  async updateQuantity(body: CreateCartDto, user: UserDocument) {
    const { productId, quantity } = body;

    await this.getAvailableProduct(productId, quantity);

    const cart = await this.cartRepository.findOne({
      userId: user._id,
      'products.productId': productId,
    });
    if (!cart) {
      throw new BadRequestException('Product not found in cart');
    }

    const product = cart.products.find((p) =>
      this.isSameProduct(p.productId, productId),
    );
    if (!product) {
      throw new BadRequestException('Product not found in cart');
    }
    product.quantity = quantity;
    const updatedCart = await cart.save();
    return this.cartResponse('Cart quantity updated successfully', updatedCart);
  }

  private async getAvailableProduct(productId: string, quantity: number) {
    const product = await this.productRepository.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });
    if (!product) {
      throw new BadRequestException('Product not found or out of stock');
    }
    return product;
  }

  private createCartProduct(
    product: ProductDocument,
    quantity: number,
  ): CartProduct {
    return {
      productId: product._id,
      quantity,
      finalPrice: product.subPrice,
    };
  }

  private isSameProduct(
    cartProductId: Types.ObjectId,
    productId: string,
  ): boolean {
    return cartProductId.toString() == productId.toString();
  }

  private cartResponse(message: string, cart: unknown) {
    return { success: true, message, cart };
  }
}
