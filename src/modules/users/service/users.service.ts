import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { UserI } from '../models/user.interface';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  /*
   * Selects all rows from user table
   * @return {[Promise<UserEntity[]>]} [Returns all rows from user table]
   */
  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  /*
   * Selects a specific user from users table by username
   * @param {[string]} username [Username provided by user at registration]
   * @return {[Promise<UserI | undefined>]} [Returns user's details]
   */
  async findOne(userName: string): Promise<UserI | undefined> {
    return this.userRepository.findOne({ userName });
  }

  /*
   * Inserts new row to user table
   * @param {[UserI]} user [User Interface]
   * @return {[Promise<UserI & UserEntity>]} [Returns new user's details]
   */
  async createUser(user: UserI): Promise<UserI & UserEntity> {
    try {
      return await this.userRepository.save(user);
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
  async updatePassword(id: number, newPasswordHash: string) {
    try {
      return this.userRepository.update(id, { password: newPasswordHash });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
