export interface VnpayBuildPaymentUrlParams {
  txnRef: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
}

export interface VnpayCallbackQuery {
  vnp_TmnCode?: string;
  vnp_Amount?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_OrderInfo?: string;
  vnp_TransactionNo?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef?: string;
  vnp_SecureHashType?: string;
  vnp_SecureHash?: string;
  [key: string]: string | undefined;
}

export interface VnpayVerifyResult {
  isValid: boolean;
  isSuccess: boolean;
  txnRef?: string;
  amount?: number;
  transactionNo?: string;
  responseCode?: string;
}

export interface VnpayCallbackResult extends VnpayVerifyResult {
  paymentFound: boolean;
  amountMatches: boolean;
  bookingId?: string;
}
