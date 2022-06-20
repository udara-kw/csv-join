import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './enum/role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass,
    ]);
    if (!requireRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (user.role?.length) {
      return user.role.some((r) => requireRoles.includes(r));
    } else {
      return false;
    }
  }
}
