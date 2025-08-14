import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_fake", {
  apiVersion: "2025-07-30.basil",
});

export class StripeService {
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error("Stripe create customer error:", error);
      throw new Error("Müşteri oluşturulamadı");
    }
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });
      return session;
    } catch (error) {
      console.error("Stripe create checkout session error:", error);
      throw new Error("Ödeme oturumu oluşturulamadı");
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });
      return subscription;
    } catch (error) {
      console.error("Stripe create subscription error:", error);
      throw new Error("Abonelik oluşturulamadı");
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error("Stripe get subscription error:", error);
      throw new Error("Abonelik bilgisi alınamadı");
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error("Stripe cancel subscription error:", error);
      throw new Error("Abonelik iptal edilemedi");
    }
  }

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      console.error("Stripe webhook verification error:", error);
      throw new Error("Webhook doğrulanamadı");
    }
  }
}

export const stripeService = new StripeService();
