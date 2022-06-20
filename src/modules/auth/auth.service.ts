import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/service/users.service';
import * as bcrypt from 'bcrypt';
import { UserI } from '../users/models/user.interface';
import { Role } from '../users/enum/role.enum';
import { UserEntity } from '../users/models/user.entity';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
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
  async validateUser(userName: string, password: string): Promise<any> {
    const user = await this.userService.findOne(userName);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, userName, ...rest } = user;
      return rest;
    }
    return null;
  }

  /*
   * Login user to system
   * @param {[Object]} userName [Object containing login details]
   * @return {[Promise<any>]} [Returns access token and user's name]
   */
  async login(user: any) {
    const payload = { name: user.name, roles: user.roles, sub: user.id };
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
  async register({ name, username, password, roles, secret }: any) {
    if (secret != process.env.CLIENT_SECRET) {
      return new HttpException('wrong secret', HttpStatus.UNAUTHORIZED);
    }
    const rolesList: Role[] = [];
    for (let i = 0; i < roles.length; i++) {
      const role: string = roles[i];
      if (!['admin', 'bot', 'virtua'].includes(role)) {
        return new HttpException('bad role', HttpStatus.BAD_REQUEST);
      } else {
        rolesList.push(
          role == 'admin' ? Role.ADMIN : role == 'bot' ? Role.BOT : Role.VIRTUA,
        );
      }
    }
    // const strongRegex = new RegExp(
    //   '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
    // );
    // if (!strongRegex.test(password)) {
    //   return new HttpException(
    //     'password strength is not enough',
    //     HttpStatus.NOT_ACCEPTABLE,
    //   );
    // }
    try {
      const newUser: UserI = {
        id: null,
        name: name,
        userName: username,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
        roles: rolesList,
      };
      const createdUser = await this.userService.createUser(newUser);
      return {
        id: createdUser.id,
        name: createdUser.name,
        username: createdUser.userName,
        roles: createdUser.roles,
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
    const users: UserEntity[] = await this.userService.findAll();
    return users?.map((user: UserEntity) => {
      return {
        id: user.id,
        name: user.name,
        userName: user.userName,
        roles: user.roles,
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
      // const strongRegex = new RegExp(
      //   '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
      // );
      // if (!strongRegex.test(password)) {
      //   return new HttpException(
      //     'new password strength is not enough',
      //     HttpStatus.NOT_ACCEPTABLE,
      //   );
      // }
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
