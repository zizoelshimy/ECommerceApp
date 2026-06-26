import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from '../models/wishlist.model';
import { DataBaseRepository } from './database.repository';

@Injectable()
export class WishlistRepository extends DataBaseRepository<WishlistDocument> {
  constructor(
    @InjectModel(Wishlist.name) wishlistModel: Model<WishlistDocument>,
  ) {
    super(wishlistModel);
  }
}
