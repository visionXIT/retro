import { Controller, Get, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuthUser } from 'auth/auth.decorator';
import { AuthGuard } from 'auth/auth.guard';
import { ErrorFilter } from 'error/api-error-http.filter';
import { SubscribeService } from './subscribe.service';

@UseFilters(ErrorFilter)
@Controller('/subscribe')
export class HttpSubscribeController {
  constructor(private _subscribeService: SubscribeService) {}

  @UseGuards(AuthGuard)
  @Get('/checkUserSubscribed')
  public async checkUserSubscribed(@AuthUser('userId') userId: number) {
    const subscribed = await this._subscribeService.checkUserSubscribed(userId);
    return subscribed;
  }

  @UseGuards(AuthGuard)
  @Get('/getSubscribeByUserAndSubscribeId')
  public async getSubscribeByUserAndSubscribeId(
    @Query('subscribeId') subscribeId: number, 
    @AuthUser('userId') userId: number) 
  {
    const subscribe = await this._subscribeService.getSubscribeByUserAndSubscribeId(userId, subscribeId);
    return subscribe;
  }

  @UseGuards(AuthGuard)
  @Get('/getSubscribeByUserId')
  public async getSubscribesByUserId(@AuthUser('userId') userId: number) {
    const subscribe = await this._subscribeService.getSubscribesByUserId(userId);
    return subscribe;
  }

  @Get('/getSubscribeIdByName/:name')
  public async getSubscribeIdByName(@Param('name') name: string) {
    const subscribeId = await this._subscribeService.getSubscribeIdByName(name);
    return subscribeId;
  }

  @UseGuards(AuthGuard)
  @Get('/getBalanceOnSubscribe')
  public async getBalanceOnSubscribe(
    @Query('subscribeId') subscribeId: number,
    @AuthUser('userId') userId: number
  ) {
    const balance = await this._subscribeService.getBalanceOnSubscribe(subscribeId, userId);
    return balance;
  }
}