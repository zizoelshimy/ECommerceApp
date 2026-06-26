import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TokenService } from 'src/common/service/token';
import { UserRepository } from 'src/DB/Repository';
import { SignUpDto } from './DTO/user.dto';
import { CompareHash } from 'src/common/security/Hash';

@Injectable()
export class UserService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly TokenService: TokenService,
  ) {}

  async signup(body: SignUpDto) {
    try {
      const { email } = body;
      const userExist = await this.UserRepository.findOne({ email });
      if (userExist) {
        throw new ConflictException('user already exist');
      }

      const user = await this.UserRepository.create(this.createUserData(body));
      return {
        success: true,
        message: 'Account created successfully! Welcome aboard!',
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async signin(body: any) {
    try {
      const { email, password } = body;
      const user = await this.UserRepository.findOne({
        email,
        confirmed: true,
      });
      if (!user) {
        throw new NotFoundException('User not found or account not confirmed');
      }
      if (!CompareHash(password, user.password)) {
        throw new BadRequestException('Invalid password. Please try again');
      }
      const access_token = this.createAuthToken(email, user['id'], '1w');
      const refresh_token = this.createAuthToken(email, user['id'], '1y');

      return {
        success: true,
        message: 'Signed in successfully! Welcome back!',
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private createUserData(body: SignUpDto) {
    const { name, email, password, DOB, phone, address, gender, role } = body;

    return {
      name,
      email,
      password,
      DOB,
      phone,
      address,
      gender,
      role,
      confirmed: true,
    };
  }

  private createAuthToken(email: string, id: string, expiresIn: string): string {
    return this.TokenService.generateToken(
      { email, id },
      { secret: process.env.JWT_SECRET, expiresIn },
    );
  }
}
