import { IntersectionType } from '@nestjs/mapped-types'
import { OkxConfigDto } from "./okxConfig.dto";
import { RandomizationConfigDto } from "./randomizationConfig.dto";

export class WithdrawConfigDto extends IntersectionType(
  RandomizationConfigDto,
  OkxConfigDto
) {}