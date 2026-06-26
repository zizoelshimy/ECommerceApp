import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Auth } from 'src/common/decorator';
import { UserRoles } from 'src/common/types/types';
import { UserDecorator } from 'src/common/decorator';
import { UserDocument } from 'src/DB/models';
import { Types } from 'mongoose';

@Controller('review')
export class ReviewController {
  constructor(private readonly _reviewService: ReviewService) {}

  @Post()
  @Auth(UserRoles.user, UserRoles.admin)
  createReview(
    @Body() body: CreateReviewDto,
    @UserDecorator() user: UserDocument,
  ) {
    return this._reviewService.createReview(body, user);
  }

  @Put(':id')
  @Auth(UserRoles.user, UserRoles.admin)
  updateReview(
    @Body() body: UpdateReviewDto,
    @UserDecorator() user: UserDocument,
    @Param('id') id: Types.ObjectId,
  ) {
    return this._reviewService.updateReview(body, user, id);
  }

  @Delete(':id')
  @Auth(UserRoles.user, UserRoles.admin)
  deleteReview(
    @UserDecorator() user: UserDocument,
    @Param('id') id: Types.ObjectId,
  ) {
    return this._reviewService.deleteReview(user, id);
  }

  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: Types.ObjectId) {
    return this._reviewService.getProductReviews(productId);
  }
}
