import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parse } from 'papaparse';
import { spawn } from 'child_process';
import { Logger } from 'winston';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const WhoisLight = require('whois-light');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const walk = require('walk');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRoot = require('app-root-path');

@Injectable()
export class CronService {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  // @Timeout(10)
  // handleTimeout() {
  // this.updateCNICCreateDetails().then(() => console.log('done'));
  // }

  @Cron(CronExpression.EVERY_2_HOURS)
  public runLftpScript(): void {
    const ls = spawn('lftp', ['-f' + appRoot + '/src/utils/lftpscript.txt']);

    ls.stdout.on('data', (data) => {
      this.logger.info(`stdout: ${data}`);
      return data;
    });

    ls.stderr.on('data', (data) => {
      const d = Buffer.from(data).toString('ascii');
      this.logger.info(`lftpscript txt stderr: ${d}`);
    });

    ls.on('error', (error) => {
      this.logger.error(error.message);
      return error;
    });

    ls.on('close', (code) => {
      this.logger.info(`child process exited with code ${code}`);
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateCNICDropDetails() {
    const walker = walk.walk(process.env.CNIC_DROP_LIST_PATH, {});
    const domains = [];
    const logger = this.logger;

    walker.on('file', function (root, fileStats, next) {
      fs.readFile(root + '/' + fileStats.name, async function (_err, data) {
        const csvData = data.toString();
        const parsedCSV = await parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => results.data,
        });
        parsedCSV?.data.forEach((record) => {
          // const domain: CNICDropEntity = {
          //   id: null,
          //   name: record['Domain_Name'],
          //   dropTime: new Date(record['Date_Purged']).getTime() / 1000,
          // };
          // domains.push(domain);
        });
        next();
      });
    });

    walker.on('errors', function (root, nodeStatsArray, next) {
      logger.error('Cannot read file:' + nodeStatsArray);
      next();
    });

    walker.on('end', function () {
      logger.info('domains list length' + domains.length);
      if (domains.length) {
        domains.sort((a, b) => {
          return (
            new Date(a.dropTime).getTime() - new Date(b.dropTime).getTime()
          );
        });
        // cnicService.saveDropDetails(domains);
      }
      logger.info('done saving drop details to db');
    });
  }
}
