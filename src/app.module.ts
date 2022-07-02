import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CSVModule } from './modules/csv_join/csv.modue';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MongooseModule } from '@nestjs/mongoose';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const os = require('os');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME,
    ),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname:
            os.platform() == 'win32'
              ? path.join(__dirname, './../logs/')
              : process.env.BASE_LOG_PATH,
          filename: 'logs.txt',
          level: 'info',
          maxsize: 1e8, // 100MB
          zippedArchive: true,
        }),
      ],
    }),
    UsersModule,
    AuthModule,
    CSVModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
