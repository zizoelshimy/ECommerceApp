import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/cart.dto';
import { UserDocument } from 'src/DB/models';
import { CartRepository, ProductRepository } from 'src/DB/Repository';

@Injectable()
export class CartService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async createCart(body: CreateCartDto, user: UserDocument) {
    const { productId, quantity } = body;

    const product = await this.productRepository.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });
    if (!product) {
      throw new BadRequestException('Product not found or out of stock');
    }

    const cart = await this.cartRepository.findOne({ userId: user._id });
    if (!cart) {
      const newCart = await this.cartRepository.create({
        userId: user._id,
        products: [
          {
            productId: product._id,
            quantity,
            finalPrice: product.subPrice,
          },
        ],
      });
      return {
        success: true,
        message: 'Product added to your cart successfully',
        cart: newCart,
      };
    }
    const productExist = cart.products.find((p) => {
      return p.productId.toString() == productId.toString();
    });
    if (productExist) {
      throw new BadRequestException('Product already exists in cart');
    }

    cart.products.push({
      productId: product._id,
      quantity,
      finalPrice: product.subPrice,
    });
    const updatedCart = await cart.save();
    return {
      success: true,
      message: 'Product added to your cart successfully',
      cart: updatedCart,
    };
  }

  async removeFromCart(productId: string, user: UserDocument) {
    const cart = await this.cartRepository.findOne({
      userId: user._id,
      'products.productId': productId,
    });
    if (!cart) {
      throw new BadRequestException('Product not found in cart');
    }

    cart.products = cart.products.filter((p) => {
      return p.productId.toString() !== productId.toString();
    });
    const updatedCart = await cart.save();
    return {
      success: true,
      message: 'Product removed from your cart successfully',
      cart: updatedCart,
    };
  }

  async updateQuantity(body: CreateCartDto, user: UserDocument) {
    const { productId, quantity } = body;

    const productExist = await this.productRepository.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });
    if (!productExist) {
      throw new BadRequestException('Product not found or out of stock');
    }

    const cart = await this.cartRepository.findOne({
      userId: user._id,
      'products.productId': productId,
    });
    if (!cart) {
      throw new BadRequestException('Product not found in cart');
    }

    const product = cart.products.find((p) => {
      return p.productId.toString() == productId.toString();
    });
    if (!product) {
      throw new BadRequestException('Product not found in cart');
    }
    product.quantity = quantity;
    const updatedCart = await cart.save();
    return {
      success: true,
      message: 'Cart quantity updated successfully',
      cart: updatedCart,
    };
  }
}
