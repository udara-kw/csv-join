import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRoot = require('app-root-path');

@Injectable()
export class CSVService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private httpService: HttpService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {
    //TODO: Add functions
  }
}
