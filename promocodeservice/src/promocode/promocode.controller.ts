import { Body, Controller, Get, Param, Post, UseFilters, UseGuards } from "@nestjs/common";
import { PromocodeService } from "./promocode.service";
import { ErrorFilter } from "error/api-error-http.filter";
import { CreatePromocodeDto } from "./dto/create-promocode.dto";
import { AuthGuard } from "auth/auth.guard";
import { AuthUser } from "auth/auth.decorator";
import { Roles } from "auth/roles.decorator";

@UseFilters(ErrorFilter)
@Controller('/promocode')
export class PromocodeController {
  constructor(
    private readonly _promocodeService: PromocodeService
  ) {}

  @UseGuards(AuthGuard)
  @Post('/usePromocode/:code')
  async usePromocode(@Param('code') promocode: string, @AuthUser('userId') userId: number) {
    await this._promocodeService.usePromocode(promocode, userId);
  }
  
  @Roles('manager')
  @UseGuards(AuthGuard)
  @Post('/createPromocode')
  async createPromocode(@Body() createPromocodeDto: CreatePromocodeDto) {
    const {config, promocode} = createPromocodeDto;
    return await this._promocodeService.createPromocode(promocode, config);
  }

  @Get('/getPromocode/:code')
  async getPromocode(@Param('code') promocode: string) {
    return await this._promocodeService.getPromocodeByCode(promocode);
  }
}