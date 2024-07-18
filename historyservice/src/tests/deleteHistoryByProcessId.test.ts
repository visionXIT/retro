import { describe, expect, it } from '@jest/globals';
import { HistoryService } from '../history/history.service';
import { HistoryRepository } from '../history/history.repository'; 
import { BriefHistoryType, HistoryCreateType, HistoryType } from '../types/types';


describe('HistoryService', () => {
  let historyService: HistoryService;
  let historyRepositoryMock: HistoryRepository;

  beforeEach(() => {
    historyRepositoryMock = new HistoryRepository();
    historyService = new HistoryService(historyRepositoryMock);
  });

  it('deleteHistoryByProcessId should delete history for a valid processId', async () => {
    // Define a valid processId
    const validProcessId = 'validProcessId';

    // Mock the getHistoryIdByProcessId method to return a valid history ID
    jest.spyOn(historyRepositoryMock, 'getHistoryIdByProcessId').mockResolvedValue(123);

    // Call the deleteHistoryByProcessId method
    await historyService.deleteHistoryByProcessId(validProcessId);

    // Expectations here, e.g., check if the history was deleted successfully
    // You can add your expectations to ensure the behavior of deleteHistoryByProcessId.

    // Restore the original implementation
    jest.restoreAllMocks();
  });

  it('deleteHistoryByProcessId should throw an error for an invalid processId', async () => {
    // Define an invalid processId
    const invalidProcessId = 'invalidProcessId';

    // Mock the getHistoryIdByProcessId method to return a non-existing history ID (0)
    jest.spyOn(historyRepositoryMock, 'getHistoryIdByProcessId').mockResolvedValue(0);

    // Call the deleteHistoryByProcessId method and expect it to throw an error
    await expect(historyService.deleteHistoryByProcessId(invalidProcessId)).rejects.toThrowError('Cannot find history with given process id');

    // Restore the original implementation
    jest.restoreAllMocks();
  });
});
