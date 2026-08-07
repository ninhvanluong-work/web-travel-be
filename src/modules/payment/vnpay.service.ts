import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HashAlgorithm,
  VNPay,
  VnpLocale,
  ignoreLogger,
  type ReturnQueryFromVNPay,
} from 'vnpay';

import {
  VnpayBuildPaymentUrlParams,
  VnpayCallbackQuery,
  VnpayVerifyResult,
} from 'src/modules/payment/types/vnpay.type';

@Injectable()
export class VnpayService {
  private logger = new Logger(VnpayService.name);

  private readonly vnpay: VNPay;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') as string;
    const secureSecret = this.configService.get<string>(
      'VNPAY_HASH_SECRET',
    ) as string;
    const vnpUrl = this.configService.get<string>('VNPAY_URL') as string;
    const apiUrl = this.configService.get<string>('VNPAY_API_URL') as string;
    this.returnUrl = this.configService.get<string>(
      'VNPAY_RETURN_URL',
    ) as string;

    this.vnpay = new VNPay({
      tmnCode,
      secureSecret,
      vnpayHost: new URL(vnpUrl).origin,
      queryDrAndRefundHost: new URL(apiUrl).origin,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });
  }

  buildPaymentUrl(params: VnpayBuildPaymentUrlParams): string {
    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: params.amount,
      vnp_IpAddr: params.ipAddr,
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_ReturnUrl: this.returnUrl,
      vnp_Locale: params.locale === 'en' ? VnpLocale.EN : VnpLocale.VN,
    });

    this.logger.log(`[buildPaymentUrl] txnRef=${params.txnRef}`);

    return paymentUrl;
  }

  verifyCallback(query: VnpayCallbackQuery): VnpayVerifyResult {
    let verified: ReturnType<VNPay['verifyReturnUrl']>;
    try {
      verified = this.vnpay.verifyReturnUrl(
        query as unknown as ReturnQueryFromVNPay,
      );
    } catch (error) {
      this.logger.warn(`[verifyCallback] ${(error as Error).message}`);
      return { isValid: false, isSuccess: false, txnRef: query.vnp_TxnRef };
    }

    const isSuccess =
      verified.isSuccess && verified.vnp_TransactionStatus === '00';

    return {
      isValid: verified.isVerified,
      isSuccess,
      txnRef: verified.vnp_TxnRef,
      amount: verified.vnp_Amount as number,
      transactionNo: verified.vnp_TransactionNo
        ? String(verified.vnp_TransactionNo)
        : undefined,
      responseCode: verified.vnp_ResponseCode
        ? String(verified.vnp_ResponseCode)
        : undefined,
    };
  }
}
