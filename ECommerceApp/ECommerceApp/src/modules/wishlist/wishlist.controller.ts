import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { Auth } from 'src/common/decorator';
import { UserRoles } from 'src/common/types/types';
import { UserDecorator } from 'src/common/decorator';
import { UserDocument } from 'src/DB/models';
import { Types } from 'mongoose';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly _wishlistService: WishlistService) {}

  @Post()
  @Auth(UserRoles.user, UserRoles.admin)
  addToWishlist(
    @Body() body: AddToWishlistDto,
    @UserDecorator() user: UserDocument,
  ) {
    return this._wishlistService.addToWishlist(body, user);
  }

  @Delete(':productId')
  @Auth(UserRoles.user, UserRoles.admin)
  removeFromWishlist(
    @UserDecorator() user: UserDocument,
    @Param('productId') productId: Types.ObjectId,
  ) {
    return this._wishlistService.removeFromWishlist(user, productId);
  }

  @Get()
  @Auth(UserRoles.user, UserRoles.admin)
  getWishlist(@UserDecorator() user: UserDocument) {
    return this._wishlistService.getWishlist(user);
  }

  @Delete()
  @Auth(UserRoles.user, UserRoles.admin)
  clearWishlist(@UserDecorator() user: UserDocument) {
    return this._wishlistService.clearWishlist(user);
  }
}
