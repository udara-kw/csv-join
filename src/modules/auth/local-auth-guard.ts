import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.body.user;
    return this.authService
      .validateUser(user.name, user.password)
      .then((validate) => {
        if (validate != null) {
          request.body.user.id = validate.id;
          request.body.user.role = validate.role;
        }
        return validate != null;
      });
  }
}
