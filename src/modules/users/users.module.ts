import { Module } from '@nestjs/common';
import { User, UserSchema } from './models/user.schema';
import { UserService } from './service/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [],
})
export class UsersModule {}
