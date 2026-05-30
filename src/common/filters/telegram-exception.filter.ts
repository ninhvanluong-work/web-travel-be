import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { request as httpsRequest } from 'https';

@Catch()
export class TelegramExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TelegramExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.extractErrorMessage(exception, errorResponse);

    await this.sendTelegramNotification(request, status, message, exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractErrorMessage(
    exception: unknown,
    errorResponse: unknown,
  ): string {
    if (typeof errorResponse === 'string') {
      return errorResponse;
    }

    if (errorResponse && typeof errorResponse === 'object') {
      const body: any = errorResponse as any;
      if (body.message) {
        return Array.isArray(body.message)
          ? (body.message as string[]).join(', ')
          : String(body.message);
      }
      if (body.error) {
        return String(body.error);
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Unexpected error';
  }

  private async sendTelegramNotification(
    request: Request,
    status: number,
    message: string,
    exception: unknown,
  ): Promise<void> {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!botToken || !chatId) {
      return;
    }

    const errorText = this.buildErrorText(request, status, message, exception);
    const payload = {
      chat_id: chatId,
      text: errorText,
      parse_mode: 'HTML',
    };

    await this.postToTelegram(botToken, payload).catch((error) => {
      this.logger.error('Failed to send Telegram notification', error as Error);
    });
  }

  private buildErrorText(
    request: Request,
    status: number,
    message: string,
    exception: unknown,
  ): string {
    const lines = [
      `<b>API Error</b>`,
      `<b>Status:</b> ${status}`,
      `<b>Method:</b> ${request.method}`,
      `<b>Path:</b> ${request.url}`,
      `<b>Message:</b> ${this.escapeHtml(this.truncate(message, 400))}`,
    ];

    if (exception instanceof Error && exception.stack) {
      lines.push(
        `<b>Stack:</b>\n<pre>${this.escapeHtml(this.truncate(exception.stack, 1000))}</pre>`,
      );
    }

    return lines.join('\n');
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private postToTelegram(
    botToken: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
      );
      const body = JSON.stringify(payload);
      const req = httpsRequest(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: `${url.pathname}${url.search}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          res.on('data', () => undefined);
          res.on('end', () => resolve());
        },
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
