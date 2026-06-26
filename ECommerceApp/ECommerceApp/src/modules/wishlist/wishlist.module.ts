import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistModel } from 'src/DB/models/wishlist.model';
import { ProductModel } from 'src/DB/models';
import { WishlistRepository } from 'src/DB/Repository/wishlist.repository';
import { ProductRepository } from 'src/DB/Repository';

@Module({
  imports: [WishlistModel, ProductModel],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository, ProductRepository],
})
export class WishlistModule {}
