import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, Cart } from './index';
import { OrderStatusTypes, PaymentMethodTypes } from 'src/common/types/types';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Cart.name, required: true })
  cartId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, enum: PaymentMethodTypes, required: true })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: OrderStatusTypes,
    default: OrderStatusTypes.pending,
  })
  status: string;

  @Prop({ type: Date })
  estimatedDelivery: Date;
}
export const OrderSchema = SchemaFactory.createForClass(Order);

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
export type OrderDocument = HydratedDocument<Order>;
