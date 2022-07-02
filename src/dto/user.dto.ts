import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../modules/users/enum/role.enum';

class user {
  @ApiProperty()
  name: string;
  @ApiProperty()
  password: string;
}

export class LoginDto {
  @ApiProperty()
  user: user;
}

export class RegisterDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  role: Role;
  @ApiProperty()
  secret: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  oldPassword: string;
  @ApiProperty()
  newPassword: string;
  @ApiProperty()
  secret: string;
}
