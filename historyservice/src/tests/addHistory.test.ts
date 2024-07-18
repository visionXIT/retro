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

  it('addHistory should add a new history log for a valid log', async () => {
    const spy = jest.spyOn(historyRepositoryMock, 'checkSubscribeId');
    spy.mockResolvedValue(true); // Mock the method to return true

    // Define a valid log
    const validLog = {
      userId: 2,
      processId: '21',
      subscribeId: {
        id: 9,
    },
    logs: ['etertertte', 'retretret'],
    };
    
    // Call the addHistory method
    await historyService.addHistory(validLog);

  });

  it('addHistory should throw an error if log with the same processId already exists', async () => {
    const log: HistoryCreateType = {
      userId: 123,
      processId: 'process123',
      subscribeId: {
        id: 11,
    },
    logs: ['etertertte', 'retretret'],
    };

    // Мокируем метод checkSubscribeId и указываем, что подписка с указанным ID существует
    jest.spyOn(historyRepositoryMock, 'checkSubscribeId').mockResolvedValue(true);

    // Мокируем метод getHistoryIdByProcessId и указываем, что запись с указанным processId уже существует
    jest.spyOn(historyRepositoryMock, 'getHistoryIdByProcessId').mockResolvedValue(123);

    const result = historyService.addHistory(log);

    await expect(result).rejects.toThrowError('Log with given process id already exists');
  });

  it('addHistory should throw an error if the specified subscribeId does not exist', async () => {
    const log: HistoryCreateType = {
      userId: 123,
      processId: 'process123',
      subscribeId: {
        id: 11,
    },
    logs: ['etertertte', 'retretret'],
    };

    // Мокируем метод checkSubscribeId и указываем, что подписка с указанным ID не существует
    jest.spyOn(historyRepositoryMock, 'checkSubscribeId').mockResolvedValue(false);

    // Предположим, что метод getHistoryIdByProcessId также мокируется

    const result = historyService.addHistory(log);

    await expect(result).rejects.toThrowError('Cannot find subscribe with given id');
  });
});

