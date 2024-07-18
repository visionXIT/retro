import { PromocodeConfig } from "types/types";

export class CreatePromocodeDto {
  promocode: string;
  config: Partial<PromocodeConfig>;
}