import { SubscribeController } from '../subscribe/subscribe.controller'; 
import { instance, mock, when } from 'ts-mockito';

const sinon = require('sinon');
require('sinon-chai');
const { expect } = require('chai');

const { SubscribeService } = require('../subscribe/subscribe.service');
const { SubscribeRepository } = require('../subscribe/subscribe.repository');
const { AddWalletsType } = require('../types/types');

import { AddWalletsType } from '../types/types';

describe('SubscribeService', () => {
  it('should add wallets to subscribe', async () => {
    const subscribeRepository = new SubscribeRepository();
    const subscribeService = new SubscribeService(subscribeRepository);
  
    const userId = 12;
    const subscribeId = 20;
    const wallets = ['', ''];
  
    // Создаем моки для методов, которые будут вызваны
    const checkSubscribeIdStub = sinon.stub(subscribeRepository, 'checkSubscribeId').resolves(true);
    const addWalletsToSubscribeStub = sinon.stub(subscribeRepository, 'addWalletsToSubscribe').resolves();
  
    // Вызываем метод, который мы хотим протестировать
    await subscribeService.addWalletsToSubscribe(userId, { subscribeId, wallets });
  
    // Проверяем, что моки были вызваны с правильными аргументами
    sinon.assert.calledWith(checkSubscribeIdStub, subscribeId);
    sinon.assert.calledWith(addWalletsToSubscribeStub, wallets, userId, subscribeId);
  });
  
});


  

