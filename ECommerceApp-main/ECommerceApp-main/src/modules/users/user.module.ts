import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { userModel } from 'src/DB/models';
import { UserRepository } from 'src/DB/Repository';
import { TokenService } from 'src/common/service/token';

@Module({
  imports: [userModel],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService, TokenService],
})
export class UserModule {}
