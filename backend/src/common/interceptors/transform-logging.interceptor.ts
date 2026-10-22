import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';

export interface StandardResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  requestId?: string;
  duration: string;
  timestamp: string;
}

interface WrappedResult<T> {
  message?: string;
  data?: T;
}

@Injectable()
export class TransformLoggingInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithId>();
    const res = http.getResponse<Response>();

    // Tiền xử lý (Pre-processing): Ghi nhận thời gian bắt đầu request
    const startTime = Date.now();
    const { method, url, requestId } = req;
    this.logger.log(`--> [${requestId}] ${method} ${url} - Bắt đầu xử lý`);

    // Chuyển tiếp tới handler / controller
    return next.handle().pipe(
      // Hậu xử lý (Post-processing): Tính thời gian hoàn tất và đóng gói phản hồi chuẩn
      map((result: T) => {
        const duration = `${Date.now() - startTime}ms`;
        const statusCode = res.statusCode || 200;

        this.logger.log(
          `<-- [${requestId}] ${method} ${url} - Hoàn tất (${statusCode}) trong ${duration}`,
        );

        let responseMessage = 'Thành công';
        let dataContent: T = result;

        if (result && typeof result === 'object') {
          const obj = result as unknown as WrappedResult<T>;
          if ('message' in obj && 'data' in obj) {
            responseMessage = obj.message ?? 'Thành công';
            dataContent = (obj.data !== undefined ? obj.data : null) as T;
          } else if ('message' in obj && Object.keys(obj).length === 1) {
            responseMessage = obj.message ?? 'Thành công';
            dataContent = null as unknown as T;
          }
        }

        return {
          statusCode,
          success: true,
          message: responseMessage,
          data: dataContent,
          requestId,
          duration,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
