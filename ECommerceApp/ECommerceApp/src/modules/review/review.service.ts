import { BadRequestException, Injectable } from '@nestjs/common';
import { ReviewRepository } from 'src/DB/Repository/review.repository';
import { ProductRepository } from 'src/DB/Repository';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewDocument, UserDocument } from 'src/DB/models';
import { Types } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(
    private readonly _reviewRepository: ReviewRepository,
    private readonly _productRepository: ProductRepository,
  ) {}

  async createReview(body: CreateReviewDto, user: UserDocument) {
    const { productId, rating, comment } = body;

    const product = await this._productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const existingReview = await this._reviewRepository.findOne({
      userId: user._id,
      productId,
    });

    if (existingReview) {
      throw new BadRequestException('You already reviewed this product');
    }

    const review = await this._reviewRepository.create({
      userId: user._id,
      productId,
      rating,
      comment,
    });

    await this.updateProductRating(productId);

    return { review };
  }

  async updateReview(
    body: UpdateReviewDto,
    user: UserDocument,
    reviewId: Types.ObjectId,
  ) {
    const review = await this._reviewRepository.findOne({
      _id: reviewId,
      userId: user._id,
    });

    if (!review) {
      throw new BadRequestException(
        'Review not found or you are not authorized',
      );
    }

    if (body.rating) review.rating = body.rating;
    if (body.comment !== undefined) review.comment = body.comment;

    await review.save();

    await this.updateProductRating(review.productId);

    return { review };
  }

  async deleteReview(user: UserDocument, reviewId: Types.ObjectId) {
    const review = await this._reviewRepository.findOneAndDelete({
      _id: reviewId,
      userId: user._id,
    });

    if (!review) {
      throw new BadRequestException(
        'Review not found or you are not authorized',
      );
    }

    await this.updateProductRating(review.productId);

    return { success: true, message: 'Review deleted successfully' };
  }

  async getProductReviews(productId: Types.ObjectId) {
    const reviews = await this._reviewRepository.find({
      filter: { productId },
      populate: [{ path: 'userId', select: 'name email' }],
      sort: '-createdAt',
    });

    return { success: true, message: 'Reviews fetched successfully', reviews };
  }

  private async updateProductRating(productId: Types.ObjectId) {
    const reviews = await this._reviewRepository.find({
      filter: { productId },
    });

    if (reviews.length === 0) {
      await this._productRepository.findOneAndUpdate(
        { _id: productId },
        { rateAvg: 0, rateNum: 0 },
      );
      return;
    }

    const avgRating = this.getAverageRating(reviews);

    await this._productRepository.findOneAndUpdate(
      { _id: productId },
      {
        rateAvg: this.roundRating(avgRating),
        rateNum: reviews.length,
      },
    );
  }

  private getAverageRating(reviews: ReviewDocument[]): number {
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return totalRating / reviews.length;
  }

  private roundRating(rating: number): number {
    return Math.round(rating * 10) / 10;
  }
}
