import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './service/cron.service';
import { CNICService } from '../cnic/service/cnic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CNICEntity } from '../cnic/models/cnic.entity';
import { HttpModule } from '@nestjs/axios';
import { CNICDropEntity } from '../cnic/models/cnicDrop.entity';
import { RegistryService } from '../registry/service/registry.service';
import { RegistryEntity } from '../registry/models/registry.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([CNICEntity, CNICDropEntity, RegistryEntity]),
    HttpModule,
  ],
  providers: [CronService, CNICService, RegistryService],
  exports: [CronService],
})
export class CronModule {}
