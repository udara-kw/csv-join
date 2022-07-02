import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/service/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/models/user.schema';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  /*
   * Validates whether user exists in the system
   * @param {[string]} userName [Username provided by user at registration]
   * @param {[string]} password [Password provided by user]
   * @return {[Promise<any>]} [Returns user details if user exists or null]
   */
  async validateUser(name: string, password: string): Promise<any> {
    const user = await this.userService.findOne(name);

    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, name: user.name, role: user.role };
    }
    return null;
  }

  /*
   * Login user to system
   * @param {[Object]} userName [Object containing login details]
   * @return {[Promise<any>]} [Returns access token and user's name]
   */
  async login(user: any) {
    const payload = { name: user.name, role: user.role, sub: user.id };
    return {
      name: user.name,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  /*
   * Register new user to system
   * @param {[Object]} UserDetails [Name, Username, Password, Roles and Client Secret are required]
   * @return {[Promise<any>]} [Returns new user's non-sensitive details]
   */
  async register({ name, password, role, secret }: any) {
    if (secret != process.env.CLIENT_SECRET) {
      return new HttpException('wrong secret', HttpStatus.UNAUTHORIZED);
    }
    try {
      const newUser = {
        name: name,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
        role: role,
      };
      const createdUser = await this.userService.createUser(newUser);
      return {
        name: createdUser.name,
        roles: createdUser.role,
      };
    } catch (e) {
      this.logger.error('Error when creating new user: ' + e);
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /*
   * View existing users of the system
   * @return {[Promise<UserEntity[]>]} [Returns all users' details]
   */
  async viewAllUsers() {
    const users: UserDocument[] = await this.userService.findAll();
    return users?.map((user: UserDocument) => {
      return {
        name: user.name,
        role: user.role,
      };
    });
  }

  /*
   * Change password of a user
   * @param {[string]} username [Username provided by user at registration]
   * @param {[string]} oldPassword [Password provided by user]
   * @param {[string]} newPassword [New password]
   * @return {[Promise<any>]} [Returns whether the password was update or not]
   */
  async changePassword(
    username: string,
    password: string,
    newPassword: string,
  ) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return new HttpException('no user', HttpStatus.NO_CONTENT);
    }
    if (await bcrypt.compare(password, user.password)) {
      try {
        const newPasswordHash = await bcrypt.hash(
          newPassword,
          await bcrypt.genSalt(),
        );
        return await this.userService.updatePassword(user.id, newPasswordHash);
      } catch (e) {
        this.logger.error('error while updating password: ', e);
        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      return new HttpException(
        'password does not match',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
