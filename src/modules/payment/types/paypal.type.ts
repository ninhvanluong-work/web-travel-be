export interface PaypalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PaypalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PaypalOrderResponse {
  id: string;
  status: string;
  links: PaypalLink[];
}

export interface PaypalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
}

export interface PaypalWebhookEvent {
  id: string;
  event_type: string;
  resource: Record<string, any>;
}
