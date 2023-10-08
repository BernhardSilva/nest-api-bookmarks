import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    //generate the password hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(
      dto.password,
      salt,
    );
    //save the user to the database
    try {
      const user = this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete (await user).hash;
      //return saved user
      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Email already exists',
          );
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find the user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    //if user does not exist throw exception
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    //compare password
    const pwMatches = await bcrypt.compare(
      dto.password,
      user.hash,
    );
    //if password incorrect throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    //send back user
    delete user.hash;
    return user;
  }
}
