import { Body, Controller, Get, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { RequestWithdrawDto } from './dto/requestWithdraw.dto';
import { OkxTokenType } from 'types/types';
import { ErrorFilter } from 'error/api-error-http.filter';
import { StopProcessDto } from './dto/stopProcess.dto';
import { RestartWithdrawDto } from './dto/restartWithdraw.dto';
import { OkxApiDto } from './dto/okxConfig.dto';
import { AuthGuard } from 'auth/auth.guard';
import { AuthUser } from 'auth/auth.decorator';

@UseFilters(ErrorFilter)
@Controller('/withdraw')
export class WithdrawController {
  constructor(private _withdrawService: WithdrawService) { }

  @UseGuards(AuthGuard)
  @Post('/stopWithdrawingFromOkx')
  public async stopWithdrawingFromOkx(
    @Body() process: StopProcessDto,
    @AuthUser('userId') userId: number
  ) {
    const { processId } = process;
    return await this._withdrawService.stopWithdrawingFromOkx(processId, userId);
  }

  @UseGuards(AuthGuard)
  @Post('/withdrawFromOkx')
  public async withdrawOnOkx(
    @Body() request: RequestWithdrawDto,
    @AuthUser('userId') userId: number
  ): Promise<{processId: string}> {
    const { wallets, config } = request;
    const processId = await this._withdrawService.withdrawFromOkx(wallets, userId, config);

    return { processId };
  }

  @UseGuards(AuthGuard)
  @Post('/restartWithdrawFromOkx')
  public async restartWithdrawFromOkx(
    @Body() request: RestartWithdrawDto,
    @AuthUser('userId') userId: number
  ): Promise<{newProcessId: string}> {
    const { processId, config } = request;
    const newProcessId = await this._withdrawService.restartWithdraw(processId, userId, config);

    return { newProcessId };
    
  }

  @Get('/getTokensAndNetworksFromOkx')
  public async getTokensAndNetworksFromOkx(): Promise<OkxTokenType[]> {
    const tokens = await this._withdrawService.getOkxTokensAndNetworks();

    return tokens;
  }

  @Post('/checkUserApi')
  public async checkApi(@Body() apis: OkxApiDto) {
    const {secretKey, passphrase, apiKey} = apis;

    return await this._withdrawService.checkOkxApi(passphrase, apiKey, secretKey);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllUserProcesses')
  public async getAllUserProcesses(@AuthUser('userId') userId: number) {
    const processes = await this._withdrawService.getAllUserProcesses(userId);

    return processes;
  }

  @UseGuards(AuthGuard)
  @Get('/getProcessStatus/:processId')
  public async getProcessStatus(
    @Param('processId') processId: string, 
    @AuthUser('userId') userId: number
  ) {
    const processes = await this._withdrawService.getProcessStatus(processId, userId);

    return processes;
  }
}
