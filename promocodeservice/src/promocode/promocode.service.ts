import { Injectable } from "@nestjs/common";
import { ApiError } from "error/api.error";
import { SubscribeEvent } from "kafka/subscribe/subscribe.event";
import { lastValueFrom } from 'rxjs';
import { CreatePromocodeConfig } from "types/types";
import { PromocodeRepository } from "./promocode.repository";

@Injectable()
export class PromocodeService {
  constructor(private readonly _promocodeRepo: PromocodeRepository, private _subscribeEvent: SubscribeEvent) {}

  async getPromocodeByCode(promocode: string) {
    const promo = await this._promocodeRepo.getPromocode(promocode);
    if (!promo) {
      throw ApiError.NotFound("Promocode not found");
    }
    return promo;
  }

  async createPromocode(promocode: string, config: CreatePromocodeConfig) {
    const promo = await this._promocodeRepo.getPromocode(promocode);
    
    if (promo) {
      throw ApiError.BadRequest("Given promocode already exists");
    }
    
    if (config.expirationTime) {
      config.expirationTime += new Date().getTime();
    }
    
    if (config.addActions?.length !== config.subscribeIds?.length) {
      throw ApiError.BadRequest("You must match all nums of adding actions to subscribe ids. Arrays' lengths should be equal");
    }

    return this._promocodeRepo.createPromocode(promocode, config);
  }

  async usePromocode(promocode: string, userId: number) {
    const promo = await this.getPromocodeByCode(promocode);

    if (promo.usedBy?.includes(userId)) {
      throw ApiError.BadRequest("You have already used this promocode");
    }

    if (promo.config.maxActivations && promo.usedBy.length >= promo.config.maxActivations) {
      throw ApiError.BadRequest("The promocode has already been used the maximum number of times")
    }

    const now = new Date().getTime();
    if (promo.config.expirationTime && now > promo.config.expirationTime) {
      throw ApiError.BadRequest("The promocode expired");
    }

    let added = false;
    if (promo.config.addActions?.length) {
      for (let [id, subscribeId] of promo.config.subscribeIds?.entries()) {
        try {
          await lastValueFrom(
            await this._subscribeEvent.subscribeAdd(
              {
                subscribeInfo: {subscribeId, numActions: promo.config.addActions[id]}, 
                userId
              })
          )
          if (!added) {
            await this._promocodeRepo.addUserToPromocode(promocode, userId, promo.usedBy);
            added = true;
          }
        } catch (error: unknown) {
          const {status, message} = error as ApiError;
          throw new ApiError(status, "Error by using a promocode: " + message);
        }
      }
    }
  }
}