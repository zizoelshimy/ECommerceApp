import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly successUrl = 'http://localhost:3000/order/success';
  private readonly cancelUrl = 'http://localhost:3000/order/failure';

  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  async createSession({ customer_email, metadata, line_items, discounts }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email,
      metadata,
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      line_items,
      discounts,
    });

    return session;
  }

  async refund(payment_intent, reason) {
    return this.stripe.refunds.create({
      payment_intent,
      reason,
    });
  }
}
