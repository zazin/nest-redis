import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const value = await this.appService.getMetadata('hello');
    Logger.log(value);
    return 'Hello Get : ' + value.data;
  }

  @Post()
  async setHello(@Body() body: { value: number }): Promise<string> {
    Logger.log(await this.appService.setMetadata('hello', body.value));
    return 'Hello Set : ' + body.value;
  }
}
