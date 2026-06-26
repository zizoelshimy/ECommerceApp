import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument } from 'src/DB/models';
import { CartRepository, OrderRepository } from 'src/DB/Repository';
import { CreateOrderDto } from './dto/order.dto';

import { OrderStatusTypes, PaymentMethodTypes } from 'src/common/types/types';
import { PaymentService } from './service/payment';

@Injectable()
export class OrderService {
  constructor(
    private readonly _orderRepository: OrderRepository,
    private readonly _cartRepository: CartRepository,
    private readonly PaymentService: PaymentService,
  ) {}
  async createOrder(user: UserDocument, body: CreateOrderDto) {
    const { address, phone, paymentMethod } = body;

    const cart = await this._cartRepository.findOne({ userId: user._id });
    if (!cart || cart.products.length == 0) {
      throw new BadRequestException('Cart not found');
    }

    const order = await this._orderRepository.create({
      userId: user._id,
      cartId: cart._id,
      totalPrice: cart.subTotal,
      phone,
      address,
      paymentMethod,
      status:
        paymentMethod == PaymentMethodTypes.cash
          ? OrderStatusTypes.confirmed
          : OrderStatusTypes.pending,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return { success: true, message: 'Order placed successfully', order };
  }

  async paymentWithStripe(user: UserDocument, orderId: string) {
    const order = await this._orderRepository.findOne(
      { _id: orderId, status: OrderStatusTypes.pending },
      [{ path: 'cartId', populate: [{ path: 'products.productId' }] }],
    );
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const session = await this.PaymentService.createSession({
      customer_email: user.email,
      metadata: { orderId: order._id.toString() },
      line_items: order.cartId['products'].map((product) => ({
        price_data: {
          currency: 'egp',
          product_data: {
            name: product.productId.name,
            images: [product.productId.mainImage.secure_url],
          },
          unit_amount: product.productId.subPrice * 100,
        },
        quantity: product.quantity,
      })),
      discounts: [],
    });

    return { url: session.url };
  }

  async webhookService(data: any) {
    const orderId = data.data.object.metadata.orderId;
    const order = await this._orderRepository.findOneAndUpdate(
      { _id: orderId },
      {
        status: OrderStatusTypes.confirmed,
      },
    );
    return { order };
  }

  async cancelOrder(user: UserDocument, orderId: string) {
    const order = await this._orderRepository.findOne({
      _id: orderId,
      userId: user._id,
      status: { $in: [OrderStatusTypes.pending, OrderStatusTypes.confirmed] },
    });

    if (!order) {
      throw new BadRequestException('Order not found or cannot be cancelled');
    }

    await this._orderRepository.findOneAndDelete({ _id: orderId });

    return {
      success: true,
      message: 'Your order has been cancelled successfully',
    };
  }

  async getAllOrders() {
    return await this._orderRepository.find({
      filter: {},
      populate: [{ path: 'cartId' }],
    });
  }
}
