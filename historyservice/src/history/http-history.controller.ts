import { ErrorFilter } from 'error/api-error-http.filter';
import { HistoryService } from './history.service';
import { Body, Controller, Get, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'auth/auth.guard';
import { AuthUser } from 'auth/auth.decorator';

@UseFilters(ErrorFilter)
@Controller('/history')
export class HttpHistoryController {
  constructor(private _historyService: HistoryService) {}

  @UseGuards(AuthGuard)
  @Get('/getAllUserBriefHistory')
  public async getAllUserBriefHistory(@AuthUser('userId') userId: number) {
    const history = await this._historyService.getAllUserBriefHistory(userId);

    return history;
  }

  @UseGuards(AuthGuard)
  @Get('/getAllUserHistory')
  public async getAllUserHistory(@AuthUser('userId') userId: number) {
    console.log(userId);
    const history = await this._historyService.getAllUserHistory(userId!);

    return history;
  }

  @Get('/getHistoryByProcessId/:processId')
  public async getHistoryByProcessId(@Param('processId') processId: string) {
    const history = await this._historyService.getHistoryByProcessId(processId);

    return history;
  }

  @Post('/deleteHistoryByProcessId')
  public async deleteHistoryByProcessId(@Body() processId: string) {
    await this._historyService.deleteHistoryByProcessId(processId);

    return { message: `Success delete history delete processId: ${processId}!` };
  }
}
