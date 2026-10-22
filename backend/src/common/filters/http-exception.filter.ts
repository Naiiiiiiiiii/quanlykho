import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId = request.requestId || 'unknown-request-id';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Không thể hoàn tất thao tác';
    let errorDetail = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: unknown = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorDetail = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        const rawMsg = resObj.message ?? exception.message;
        errorDetail =
          typeof resObj.error === 'string' ? resObj.error : exception.name;

        if (Array.isArray(rawMsg)) {
          message = rawMsg.map(String).join('; ');
        } else if (typeof rawMsg === 'string') {
          message = rawMsg;
        }
      }
    } else {
      this.logger.error(
        `[${requestId}] Lỗi ngoại lệ hệ thống không mong muốn:`,
        exception,
      );
    }

    // Map các thông báo chuẩn theo đặc tả Sequence Diagram nếu cần
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Không thể hoàn tất thao tác';
    }

    this.logger.warn(
      `[${requestId}] Phản hồi lỗi ${status} tới client: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      success: false,
      message,
      error: errorDetail,
      requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
