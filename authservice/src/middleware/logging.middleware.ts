import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly _logger = new Logger('HTTP');

    use(req: Request & { user: any }, res: Response, next: NextFunction) {
        const { method, originalUrl: url, ip } = req;
        const reqTime = Date.now();

        const user = req['user'];

        this._logger.log(`Request: ${JSON.stringify({ method, url, ip, user: user?.login ?? null })}`);

        res.on('finish', () => {
            const { statusCode } = res;
            this._logger.log(`Response: ${JSON.stringify({ method, url, ip, statusCode, user: user?.login ?? null, responseTime: Date.now() - reqTime})}`);
        });

        next();
    }
}