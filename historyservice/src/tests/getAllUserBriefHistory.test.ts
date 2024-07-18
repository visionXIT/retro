import { describe, expect, it } from '@jest/globals';
import { HistoryService } from '../history/history.service';
import { HistoryRepository } from '../history/history.repository'; 
import { BriefHistoryType, HistoryCreateType, HistoryType } from '../types/types';

export const createMockBriefHistoryData = (userId: number): BriefHistoryType[] => {
  // Создайте мокируемые данные для краткой истории пользователя с userId
  const mockBriefHistory: BriefHistoryType[] = [
    {
      userId,
      subscribeId:{
        id: 2,
    },
      processId: 'process1',
      subscribeName: 'Subscribe 1',
    },
    {
      userId,
      subscribeId:{
        id: 5,
    },
      processId: 'process2',
      subscribeName: 'Subscribe 2',
    },
    // Добавьте другие записи по мере необходимости
  ];

  return mockBriefHistory;
};


describe('HistoryService', () => {
  let historyService: HistoryService;
  let historyRepositoryMock: HistoryRepository;

  beforeEach(() => {
    historyRepositoryMock = new HistoryRepository();
    historyService = new HistoryService(historyRepositoryMock);
  });

  it('getAllUserBriefHistory should return brief history for a valid user', async () => {
    const userId = 123; // Замените на действительный идентификатор пользователя
    const mockBriefHistory = createMockBriefHistoryData(userId); // Используйте функцию создания мокируемых данных

    const mock = jest.spyOn(historyRepositoryMock, 'getAllUserBriefHistory');
    mock.mockResolvedValue(mockBriefHistory);

    const result = await historyService.getAllUserBriefHistory(userId);

    expect(result).toEqual(mockBriefHistory);
    mock.mockRestore();
  });

  it('getAllUserBriefHistory should throw an error for an invalid user', async () => {
    const userId = 456; // Замените на недействительный идентификатор пользователя

    const mock = jest.spyOn(historyRepositoryMock, 'getAllUserBriefHistory');
    mock.mockRejectedValue(new Error('You must provide a user id')); // Используйте mockRejectedValue для выброса ошибки
  
    await expect(historyService.getAllUserBriefHistory(userId)).rejects.toThrow('You must provide a user id'); // Обновленный вызов функции
  
    mock.mockRestore();
  });
});

