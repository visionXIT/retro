import { Body, Controller, Get, Param, Post, Query, UseFilters, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MultiplicatorService } from './multiplicator.service';
import { ErrorFilter } from 'error/api-error-http.filter';
import { MultiplicationRepository } from './multiplication.repository';
import { ApiError } from 'error/api.error';
import { UtilsBuildObjectForResponse } from './utils/utils-object-process-builder';
import { OptionType } from 'types/multiplication.types';
import { AuthGuard } from 'auth/auth.guard';
import { AuthUser } from 'auth/auth.decorator';

@UseFilters(ErrorFilter)
@UseGuards(AuthGuard)
@Controller('/multiplication')
export class MultiplicationController {
  constructor(private _multiplicatorService: MultiplicatorService, private _repository: MultiplicationRepository) {}

  @Post('/startProcess')
  async startProcess(@Body() message: { wallets: string[]; options: OptionType }, @AuthUser('userId') userId: number) {
    const { wallets, options } = message;
    options.userId = userId;

    const instanceProcess = await this._multiplicatorService.startProcess(wallets, options);
    const { idProcess } = instanceProcess;
    const modeProcessReturningFields =
      UtilsBuildObjectForResponse.settingResponseObjectForProcessConfiguration(options);

    return {
      ...modeProcessReturningFields,
      idProcess,
      message: `A process ${options.actionType} has been created ${this._multiplicatorService.idProcess}`,
    };
  }

  @Post('/stopProcess/:idProcess')
  async stopProcess(@Param('idProcess') idProcess: string, @AuthUser('userId') userId: number) {
    await this._multiplicatorService.stopProcess(idProcess, userId);
    return {
      idProcess,
      message: `Process ${idProcess} was stoped!`,
    };
  }

  @Post('/emergencyStopProcess/:idProcess')
  async emergencyStopProcess(@Param('idProcess') idProcess: string, @AuthUser('userId') userId: number) {
    await this._multiplicatorService.emergencyStop(idProcess, userId);

    return {
      idProcess,
      message: `Process ${idProcess} was stoped!`,
    };
  }

  @Post('/continueProcess/:idProcess')
  async continueProcess(
    @Param('idProcess') idProcess: string,
    @Body() message: { options: OptionType },
    @AuthUser('userId') userId: number,
  ) {
    const { options } = message;

    if (options) {
      options.userId = userId;
    }

    await this._multiplicatorService.continueProcess(idProcess, userId, options);
    const status = await this._multiplicatorService.getStatusProcess(idProcess);

    return {
      idProcess,
      message:
        status === 'disabled'
          ? `The process ${idProcess} is restarted!`
          : `Something went wrong. The process was disabled!`,
    };
  }

  @Get('/checkStatusProcess')
  async checkStatusProcess(@Query('idProcess') idProcess: string, @AuthUser('userId') userId: number) {
    const status = await this._repository.checkingStatusProcess(idProcess, userId);

    if (!status) {
      ApiError.NotFound('Process status is not existing!');
    }

    return {
      processStatus: status,
    };
  }

  @Get('/getAllProcess')
  async getAllIdProcess(@AuthUser('userId') userId: number) {
    const allProcess = await this._repository.getAllProcessInfo(userId);
    return allProcess;
  }



  @Get('/getEcosystemDataByUserId')
  async getEcosystemDataByUserId(@AuthUser('userId') userId: number) {
    const ecosystemData = await this._repository.getEcosystemDataByUserId(userId);
    return ecosystemData;
  }
}
