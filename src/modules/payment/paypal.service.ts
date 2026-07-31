import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  PaypalAccessTokenResponse,
  PaypalCaptureResponse,
  PaypalOrderResponse,
} from 'src/modules/payment/types/paypal.type';

@Injectable()
export class PaypalService {
  private logger = new Logger(PaypalService.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private readonly webhookId: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>(
      'PAYPAL_CLIENT_ID',
    ) as string;
    this.clientSecret = this.configService.get<string>(
      'PAYPAL_CLIENT_SECRET',
    ) as string;
    this.webhookId = this.configService.get<string>(
      'PAYPAL_WEBHOOK_ID',
    ) as string;
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') as string;

    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';
    this.baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const response =
      await this.httpService.axiosRef.post<PaypalAccessTokenResponse>(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

    return response.data.access_token;
  }

  async createOrder(params: {
    bookingCode: string;
    amount: number;
    currency: string;
  }): Promise<PaypalOrderResponse> {
    const { bookingCode, amount, currency } = params;
    const accessToken = await this.getAccessToken();

    const response = await this.httpService.axiosRef.post<PaypalOrderResponse>(
      `${this.baseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: bookingCode,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Web Travel',
          user_action: 'PAY_NOW',
          return_url: `${this.frontendUrl}/payment/paypal/return`,
          cancel_url: `${this.frontendUrl}/payment/paypal/cancel`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(
      `[createOrder] booking=${bookingCode} orderId=${response.data.id} status=${response.data.status}`,
    );

    return response.data;
  }

  async captureOrder(orderId: string): Promise<PaypalCaptureResponse> {
    const accessToken = await this.getAccessToken();

    const response =
      await this.httpService.axiosRef.post<PaypalCaptureResponse>(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

    this.logger.log(
      `[captureOrder] orderId=${orderId} status=${response.data.status}`,
    );

    return response.data;
  }

  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: Record<string, any>,
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const response = await this.httpService.axiosRef.post<{
      verification_status: string;
    }>(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: this.webhookId,
        webhook_event: body,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.verification_status === 'SUCCESS';
  }
}
