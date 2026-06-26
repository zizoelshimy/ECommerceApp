import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartModel, ProductModel } from 'src/DB/models';
import { CartRepository, ProductRepository } from 'src/DB/Repository';

@Module({
  imports: [CartModel, ProductModel],
  controllers: [CartController],
  providers: [CartService, ProductRepository, CartRepository],
})
export class CartModule {}
