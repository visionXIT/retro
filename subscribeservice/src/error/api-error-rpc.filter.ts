import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { ApiError } from './api.error';
import { throwError } from 'rxjs';

@Catch()
export class RpcErrorFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const msg = (exception as {message: string})?.message;
    const status = (exception as {status: number})?.status;
    
    return throwError(() => new ApiError(status ?? 500, msg ?? 'Internal server error'));
  }
}