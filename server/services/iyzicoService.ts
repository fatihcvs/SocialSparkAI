import { Buffer } from "node:buffer";

interface CheckoutResult {
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
}

class IyzicoService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.IYZICO_API_KEY || "";
    this.secretKey = process.env.IYZICO_SECRET_KEY || "";
    this.baseUrl =
      process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

    if (!this.apiKey || !this.secretKey) {
      throw new Error("IYZICO_API_KEY and IYZICO_SECRET_KEY must be set");
    }
  }

  async createCheckoutForm(
    email: string,
    name: string,
    price: number,
    callbackUrl: string,
  ): Promise<CheckoutResult> {
    const body = {
      locale: "tr",
      conversationId: `conv-${Date.now()}`,
      price: price.toFixed(2),
      paidPrice: price.toFixed(2),
      currency: "TRY",
      basketId: `B${Date.now()}`,
      paymentGroup: "SUBSCRIPTION",
      callbackUrl,
      buyer: {
        id: "BY123",
        name,
        surname: name,
        email,
        identityNumber: "11111111111",
        registrationAddress: "Turkey",
        ip: "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: name,
        city: "Istanbul",
        country: "Turkey",
        address: "Turkey",
      },
      billingAddress: {
        contactName: name,
        city: "Istanbul",
        country: "Turkey",
        address: "Turkey",
      },
      basketItems: [
        {
          id: "BI123",
          name: "Pro Plan",
          category1: "Subscription",
          itemType: "VIRTUAL",
          price: price.toFixed(2),
        },
      ],
    };

    const response = await fetch(
      `${this.baseUrl}/iyzipos/checkoutform/initialize/auth/ecom`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.secretKey}`).toString("base64")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Iyzico request failed: ${response.status}`);
    }

    const data = (await response.json()) as CheckoutResult;
    return data;
  }
}

export const iyzicoService = new IyzicoService();

