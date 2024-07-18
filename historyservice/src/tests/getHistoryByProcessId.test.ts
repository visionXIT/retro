import { describe, expect, it } from '@jest/globals';
import { HistoryService } from '../history/history.service';
import { HistoryRepository } from '../history/history.repository'; 
import { BriefHistoryType, HistoryCreateType, HistoryType, IHistoryService } from '../types/types';
import { Injectable } from '@nestjs/common';


describe('HistoryService', () => {
  let historyService: HistoryService;
  let historyRepositoryMock: HistoryRepository;

  beforeEach(() => {
    historyRepositoryMock = new HistoryRepository() as any;
    historyService = new HistoryService(historyRepositoryMock);
  });


    it('getHistoryByProcessId should return the history for a valid processId', async () => {
      const mockHistoryData =  {"logs": ["log1","log2"], "processId": "15", "subscribeName": "zksync"};
      const getHistoryByProcessIdMock = jest.fn().mockResolvedValue(mockHistoryData);
      historyRepositoryMock.getHistoryByProcessId = getHistoryByProcessIdMock;
  
      const processId = 'validProcessId';
      const result = await historyService.getHistoryByProcessId(processId);
  
      expect(result).toEqual(mockHistoryData);
    });
  
    it('getHistoryByProcessId should throw an error for an invalid processId', async () => {
      const getHistoryByProcessIdMock = jest.fn().mockResolvedValue(null);
      historyRepositoryMock.getHistoryByProcessId = getHistoryByProcessIdMock;
  
      const processId = 'invalidProcessId';
  
      await expect(historyService.getHistoryByProcessId(processId)).rejects.toThrowError('Incorrect process id');
    });

  // Similar tests for other methods: getAllUserBriefHistory, getAllUserHistory, addHistory, deleteHistoryByProcessId
});

