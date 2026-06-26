import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewModel } from 'src/DB/models/review.model';
import { ProductModel } from 'src/DB/models';
import { ReviewRepository } from 'src/DB/Repository/review.repository';
import { ProductRepository } from 'src/DB/Repository';

@Module({
  imports: [ReviewModel, ProductModel],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, ProductRepository],
})
export class ReviewModule {}
