import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const whoiser = require('whois-light');

@Injectable()
export class AppService {
  private readonly logger = new Logger();

  async whoisLookup(domains: string[], givenDropTimes: Date[]): Promise<any> {
    let domain;
    const won: string[] = [];
    const dropTimes: string[] = [];
    const registrars: string[] = [];
    const delays: string[] = [];
    const dropWindow = parseInt(process.env.CNIC_INITIAL_BURST_SECONDS);
    try {
      const result = await whoiser.bulkLookup(
        { format: true, parellel: 100 },
        domains,
      );
      this.logger.log('whois lookup', result.toString());
      if (!!result) {
        for (let i = 0; i < domains.length; i++) {
          domain = domains[i];
          won.push(
            result[domain]['Registrar']
              ? result[domain]['Registrar']
                  .toLowerCase()
                  .includes('virtua drug')
                ? 'Success'
                : 'Failed'
              : '',
          );
          dropTimes.push(
            result[domain]['Creation Date']
              ? result[domain]['Creation Date']
              : '',
          );
          registrars.push(
            result[domain]['Registrar']
              ? result[domain]['Registrar']
                  .toLowerCase()
                  .includes('virtua drug')
                ? 'VIRTUA DRUG'
                : result[domain]['Registrar']
              : '',
          );
          delays.push(
            registrars[i]
              ? calculateDelay(
                  (new Date(dropTimes[i]).getTime() -
                    givenDropTimes[i].getTime()) /
                    1000,
                  dropWindow,
                )
              : '',
          );
        }
        return {
          success: true,
          domains,
          givenDropTimes,
          won,
          registrars,
          dropTimes,
          delays,
        };
      } else {
        return { success: false };
      }
    } catch (e) {
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }
}

function calculateDelay(delay: number, dropWindow: number): string {
  if (delay < dropWindow) {
    return 'Yes';
  } else {
    const hoursRemoved = delay % 3600;
    return (
      'No, ' +
      getString(Math.floor(delay / 3600), 'hour') +
      ' ' +
      getString(Math.floor(hoursRemoved / 60), 'minute') +
      ' ' +
      getString(hoursRemoved % 60, 'second')
    );
  }
}

function getString(value: number, timestamp: string) {
  return value
    ? value == 1
      ? value + ' ' + timestamp
      : value + ' ' + timestamp + 's'
    : '';
}
