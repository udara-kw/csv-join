import {
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
  async findOne(userName: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ userName }).exec();
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /*
   * Update password column in user table
   * @param {[int]} id [User's id]
   * @param {[string]} newPasswordHash [New value to replace existing value]
   * @return {[Promise<UserI & UserEntity>]} [Returns whether row was updated or not]
   */
  async updatePassword(name: string, newPasswordHash: string) {
    try {
      const existingUser = this.userModel.findOne({ name });
      existingUser.update({ password: newPasswordHash });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
