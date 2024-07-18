import { BriefHistoryType, HistoryType, IHistoryService } from 'types/types';
import { HistoryRepository } from './history.repository';
import { Injectable } from '@nestjs/common';
import { ApiError } from 'error/api.error';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService implements IHistoryService {
  constructor(private _historyRepo: HistoryRepository) {}

  public async getHistoryByProcessId(processId: string): Promise<HistoryType> {
    if (!processId) {
      throw ApiError.BadRequest('You must provide a process id');
    }

    const history = await this._historyRepo.getHistoryByProcessId(processId);

    if (!history) {
      throw ApiError.BadRequest('Incorrect process id');
    }

    return history;
  }

  public async getAllUserBriefHistory(userId: number): Promise<BriefHistoryType[]> {
    if (!userId) {
      throw ApiError.BadRequest('You must provide a user id');
    }

    return await this._historyRepo.getAllUserBriefHistory(userId);
  }

  public async getAllUserHistory(userId: number): Promise<HistoryType[]> {
    if (!userId) {
      throw ApiError.BadRequest('You must provide a user id');
    }

    return await this._historyRepo.getAllUserHistory(userId);
  }

  public async addHistory(log: CreateHistoryDto) {
    const id = await this._historyRepo.getHistoryIdByProcessId(log.processId);
    
    if (id) {
      throw ApiError.BadRequest('Log with given process id already exists');
    }

    const isSubscribeExist = await this._historyRepo.checkSubscribeId(log.subscribeId);

    if (!isSubscribeExist) {
      throw ApiError.NotFound('Cannot find subscribe with given id');
    }

    await this._historyRepo.addHistory(log);
  }

  public async deleteHistoryByProcessId(processId: string) {
    if (!processId) {
      throw ApiError.BadRequest('You must provide process id');
    }

    const id = await this._historyRepo.getHistoryIdByProcessId(processId);

    if (!id) {
      throw ApiError.NotFound('Cannot find history with given process id');
    }

    await this._historyRepo.deleteHistoryByProcessId(processId);
  }
}
