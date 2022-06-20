import { SetMetadata } from '@nestjs/common';
import { IP } from './enum/ip.enum';

export const IPS_KEY = 'ips';
export const AllowedIPs = (...ips: IP[]) => SetMetadata(IPS_KEY, ips);
