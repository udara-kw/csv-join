import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { LocalAuthGuard } from './modules/auth/local-auth-guard';
import {
  ChangePasswordDto,
  DeleteUserDto,
  LoginDto,
  RegisterDto,
} from './dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AllowedRoles } from './modules/users/roles.decorator';
import { Role } from './modules/users/enum/role.enum';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/users/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

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

  // Change password to a new one
  @ApiBearerAuth('JWT')
  @Post('changePassword')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  changePassword(@Body() req: ChangePasswordDto): any {
    console.log(req);
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

  // View current users registered with system
  @ApiBearerAuth('JWT')
  @Delete('deleteUser/:username')
  @AllowedRoles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteUser(@Param() params: DeleteUserDto): any {
    return this.authService.deleteUser(params.username);
  }
}
