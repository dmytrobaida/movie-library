import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class TrailingSlashFilter implements ExceptionFilter {
  catch(_: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.url.at(-1) !== '/') {
      response.redirect(HttpStatus.MOVED_PERMANENTLY, `${request.url}/`);
    }
  }
}
