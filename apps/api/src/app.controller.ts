import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { APP_NAME } from '@media-force/shared';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // return this.appService.getHello();

    //testing out my mono repo : remove
    return `Welcome to the ${APP_NAME} Backend API!`;
  }
}
