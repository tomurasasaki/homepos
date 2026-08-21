import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message || 'Internal server error' };

    let errorString = 'Internal Server Error';
    let detailedMessage = exception.message || 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      errorString = res.error || exception.name;
      detailedMessage = res.message || res;
    } else if (exception && typeof exception === 'object') {
      detailedMessage = exception.message || JSON.stringify(exception);
    }

    // Keep clean production output without stack trace representation
    response.status(status).json({
      error: errorString,
      message: Array.isArray(detailedMessage) ? detailedMessage[0] : detailedMessage,
      statusCode: status,
    });
  }
}
