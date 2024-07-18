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

  it('getAllUserHistory should return user history for a valid user', async () => {
    const userId = 123; // Замените на действительный ID пользователя
    const mockUserHistory: HistoryType[] = [
      {
        userId: 123,
        processId: 'process123',
        subscribeName: 'Subscribe 1',
        subscribeId: {
          id: 11,
      },
        logs: ['etertertte', 'retretret'],
        // Другие поля и данные по истории
      },
      {
        userId: 123,
        processId: 'process124',
        subscribeName: 'Subscribe 2',
        subscribeId: {
          id: 11,
      },
        logs: ['etertertte', 'retretret'],

      },
      // Дополнительные записи истории для пользователя
    ];

    // Мокируем метод getAllUserHistory и указываем, что он должен возвращать mockUserHistory
    jest.spyOn(historyRepositoryMock, 'getAllUserHistory').mockResolvedValue(mockUserHistory);

    const result = await historyService.getAllUserHistory(userId);

    expect(result).toEqual(mockUserHistory);
  });
  it('getAllUserHistory should throw an error for an invalid user', async () => {
    const userId = 456; // Замените на недействительный идентификатор пользователя

    const mock = jest.spyOn(historyRepositoryMock, 'getAllUserHistory');
    mock.mockRejectedValue(new Error('You must provide a user id'));

    await expect(historyService.getAllUserHistory(userId)).rejects.toThrow('You must provide a user id');

    mock.mockRestore();
  });
});

