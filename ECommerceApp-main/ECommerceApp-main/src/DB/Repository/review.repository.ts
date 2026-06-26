import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../models/review.model';
import { DataBaseRepository } from './database.repository';

@Injectable()
export class ReviewRepository extends DataBaseRepository<ReviewDocument> {
  constructor(@InjectModel(Review.name) reviewModel: Model<ReviewDocument>) {
    super(reviewModel);
  }
}
