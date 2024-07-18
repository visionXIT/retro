import { CollectorParams } from "types/operations.types";
import { CollectorService } from "../collector.service";

export class UtilsCollector {
  public static async makeCollection(params: CollectorParams) {
    return CollectorService.collectAllTokens(params);
  }
}