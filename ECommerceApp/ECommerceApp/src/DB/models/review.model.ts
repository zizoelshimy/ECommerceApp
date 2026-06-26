import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, Product } from './index';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, trim: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const ReviewModel = MongooseModule.forFeature([
  { name: Review.name, schema: ReviewSchema },
]);

export type ReviewDocument = HydratedDocument<Review>;
