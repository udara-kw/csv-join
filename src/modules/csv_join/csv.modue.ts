import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CSVService } from './service/csv.service';
import { CSVController } from './controller/csv.controller';
import { CSVEntity } from './models/csv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CSVEntity]), HttpModule],
  providers: [CSVService],
  exports: [CSVService],
  controllers: [CSVController],
})
export class CSVModule {}
