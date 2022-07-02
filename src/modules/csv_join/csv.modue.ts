import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CSVService } from './service/csv.service';
import { CSVController } from './controller/csv.controller';
import { CSV, CSVSchema } from './models/csv.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CSV.name, schema: CSVSchema }]),
    HttpModule,
  ],
  providers: [CSVService],
  exports: [CSVService],
  controllers: [CSVController],
})
export class CSVModule {}
