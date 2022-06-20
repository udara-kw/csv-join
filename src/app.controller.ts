import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { LocalAuthGuard } from './modules/auth/local-auth-guard';
import { AppService } from './app.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/user.dto';
import { WhoisDto } from './dto/whois.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AllowedRoles } from './modules/users/roles.decorator';
import { Role } from './modules/users/enum/role.enum';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/users/roles.guard';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
  ) {}

  //Login the user and return JWT token
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() req: LoginDto): any {
    return this.authService.login(req.user);
  }

  // Add new user to the system
  @ApiBearerAuth('JWT')
  @Post('addUser')
  @AllowedRoles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  addUser(@Body() req: RegisterDto): any {
    return this.authService.register(req);
  }

  @Post('strengthTest')
  strengthTest(@Body() password: string) {
    const strongRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})$',
    );
    if (strongRegex.test(password)) {
      return true;
    } else {
      throw new HttpException(
        'password strength is not enough',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  // Change password to a new one
  @ApiBearerAuth('JWT')
  @Post('changePassword')
  @AllowedRoles(Role.ADMIN, Role.VIRTUA)
  @UseGuards(JwtAuthGuard, RolesGuard)
  changePassword(@Body() req: ChangePasswordDto): any {
    if (req.secret != process.env.CLIENT_SECRET) {
      return new HttpException('bad secret', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.changePassword(
      req.username,
      req.oldPassword,
      req.newPassword,
    );
  }

  // View current users registered with system
  @ApiBearerAuth('JWT')
  @Get('viewAllUsers')
  @AllowedRoles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  viewAllUsers(): any {
    return this.authService.viewAllUsers();
  }

  @Post('whois')
  getWhois(@Body() req: WhoisDto): any {
    if (req.domains.length < 1) {
      throw new HttpException('Empty', HttpStatus.NO_CONTENT);
    }
    const domains = req.domains.map((d) => {
      return d[0];
    });
    const dropTimes = req.domains.map((d) => {
      return new Date(d[1]);
    });
    return this.appService.whoisLookup(domains, dropTimes);
  }
}
