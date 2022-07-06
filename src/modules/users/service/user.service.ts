import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, UserDocument } from '../models/user.schema';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  /*
   * Selects all rows from user table
   * @return {[Promise<UserEntity[]>]} [Returns all rows from user table]
   */
  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  /*
   * Selects a specific user from users table by username
   * @param {[string]} username [Username provided by user at registration]
   * @return {[Promise<UserI | undefined>]} [Returns user's details]
   */
  async findOne(name: string): Promise<UserDocument | undefined> {
    return await this.userModel.findOne({ name }).exec();
  }

  /*
   * Inserts new row to user table
   * @param {[UserI]} user [User Interface]
   * @return {[Promise<UserI & UserEntity>]} [Returns new user's details]
   */
  async createUser(user): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(user);
      return createdUser.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Update password column in user table
   * @param {[string]} name [User's name]
   * @param {[string]} newPasswordHash [New value to replace existing value]
   * @return {[Promise<UserI & UserEntity>]} [Returns whether row was updated or not]
   */
  async updatePassword(id: string, newPasswordHash: string) {
    try {
      await this.userModel.findOneAndUpdate(
        { id: id },
        {
          password: newPasswordHash,
        },
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteUser(id: string) {
    try {
      await this.userModel.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
