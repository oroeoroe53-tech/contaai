import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export async function createCheckoutSession(priceId) {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });
    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export const PLANS = {
  pro: {
    name: "Pro",
    price: 9.99,
    priceId: "price_xxxxx", // Lo setearemos después
    features: ["Ambos modos", "Transacciones ilimitadas", "PDFs avanzados", "5GB almacenamiento"]
  },
  premium: {
    name: "Premium",
    price: 24.99,
    priceId: "price_yyyyy", // Lo setearemos después
    features: ["Todo Pro +", "IA fiscal", "Análisis 12 meses", "Soporte 24/7"]
  }
};
