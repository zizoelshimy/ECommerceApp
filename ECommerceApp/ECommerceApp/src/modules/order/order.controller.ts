import {
  Body,
  Controller,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth, UserDecorator } from 'src/common/decorator';
import { UserRoles } from 'src/common/types/types';
import { UserDocument } from 'src/DB/models';
import { CreateOrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @Auth(UserRoles.admin, UserRoles.user)
  @UsePipes(new ValidationPipe())
  async createOrder(
    @UserDecorator() user: UserDocument,
    @Body() body: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user, body);
  }

  @Post('create-payment')
  @Auth(UserRoles.admin, UserRoles.user)
  @UsePipes(new ValidationPipe())
  async paymentWithStripe(
    @UserDecorator() user: UserDocument,
    @Body('orderId') orderId: string,
  ) {
    return this.orderService.paymentWithStripe(user, orderId);
  }

  @Post('webhook')
  async webhookService(@Body() data: any) {
    return this.orderService.webhookService(data);
  }

  @Put('cancel')
  @Auth(UserRoles.admin, UserRoles.user)
  @UsePipes(new ValidationPipe())
  async cancelOrder(
    @UserDecorator() user: UserDocument,
    @Body('orderId') orderId: string,
  ) {
    return this.orderService.cancelOrder(user, orderId);
  }
}
