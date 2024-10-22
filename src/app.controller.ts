import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('private')
  @UseGuards(AuthGuard('jwt'))
  getPrivate(): string {
    return 'private route'
  }

  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  getRefresh(@Req() req: Request) {
    const user = req.user
    console.log(user)
  }
}
