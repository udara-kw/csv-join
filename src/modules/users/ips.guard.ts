import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IP } from './enum/ip.enum';
import { IPS_KEY } from './ips.decorator';
import { Logger } from 'winston';

@Injectable()
export class IPGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requireIPs = this.reflector.getAllAndOverride<IP[]>(IPS_KEY, [
      context.getHandler(),
      context.getClass,
    ]);
    if (!requireIPs) {
      return true;
    }
    const reqIP: string = context.switchToHttp().getRequest().ip;
    const ipSplit = reqIP.split(':');
    if (!ipSplit.length) {
      this.logger.warn('Failed to get ip from (' + reqIP + ')');
      return false;
    }
    const host: string = ipSplit[ipSplit.length - 1];
    if (host) {
      if (requireIPs.includes(<IP>host)) {
        return true;
      } else {
        this.logger.warn('Unknown IP (' + host + ') tried to access system');
        return false;
      }
    } else {
      return false;
    }
  }
}
