import { Injectable, Logger } from '@nestjs/common';
import * as redis from 'redis';
import * as fs from 'fs';

@Injectable()
export class AppService {
  ssl = {
    key: fs.readFileSync('/tmp/redis/server.key', 'ascii'),
    cert: fs.readFileSync('/tmp/redis/server.crt', 'ascii'),
    ca: [fs.readFileSync('/tmp/redis/rootCA.crt', 'ascii')],
    checkServerIdentity: () => {
      return null;
    },
  };

  private clientRedis = redis.createClient({
    host: '192.168.18.60',
    port: 6379,
    password: 'password',
    tls: this.ssl,
  });

  protected objToStr(value: any): string {
    return JSON.stringify(value);
  }

  protected strToObj(value: string): any {
    return JSON.parse(value);
  }

  async getMetadata(key: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.clientRedis.get(key, (err, result) => {
        if (err) {
          Logger.error(
            JSON.stringify(err.message),
            key,
            'REDIS ERROR GET METADATA',
          );
          return resolve({
            status: false,
            data: err.message,
          });
        } else {
          return resolve({
            status: true,
            data: this.strToObj(result),
          });
        }
      });
    });
  }

  async setMetadata(key: string, value: any, ttl = 3600): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.clientRedis.set(key, this.objToStr(value), (err, result) => {
        if (err) {
          Logger.error(
            JSON.stringify(err.message),
            key,
            'REDIS ERROR SET METADATA',
          );
          return resolve({
            status: false,
            data: err.message,
          });
        } else {
          this.clientRedis.expire(key, ttl, (error) => {
            if (error) {
              Logger.error(
                JSON.stringify(error.message),
                key,
                'REDIS ERROR SET TTL',
              );
              return resolve({
                status: false,
                data: error.message,
              });
            }
          });
          return resolve({
            status: true,
            data: result,
          });
        }
      });
    });
  }
}
