import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CSVService } from '../service/csv.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllowedRoles } from '../../users/roles.decorator';
import { Role } from '../../users/enum/role.enum';
import { CSVDto } from '../dto/csv';
import { Logger } from 'winston';
import { RolesGuard } from '../../users/roles.guard';

@ApiTags('Namerider')
@Controller('nameRider')
export class CSVController {
  constructor(
    private readonly csvService: CSVService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  // Add new TLD to system
  @ApiBearerAuth('JWT')
  @Post('addTLD')
  @AllowedRoles(Role.ADMIN, Role.VIRTUA)
  @UseGuards(JwtAuthGuard, RolesGuard)
  addTLD(@Body() req: CSVDto): Promise<any> {
    if (req.secret != process.env.CLIENT_SECRET) {
      throw new HttpException('wrong secret code', HttpStatus.UNAUTHORIZED);
    }
    // return this.csvService.addTLD(req.tld, req.registry);
    return;
  }
}
