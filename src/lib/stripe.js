import { loadStripe } from "@stripe/stripe-js";
import {supabase} from "../services/supabaseClient"// Adjust the import path as necessay
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Create a Stripe Customer Portal session and redirect the user
export const redirectToCustomerPortal = async (customerId) => {
  console.log("Redirecting to customer portal with customerId:", customerId);
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-customer-portal-session",
      {
        body: {
          customerId,
          returnUrl: window.location.origin + "/settings",
        },
      }
    );

    if (error) {
      console.error("Error response from function:", error);
      throw new Error(error.message || "Failed to create portal session");
    }

    if (data && data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No portal URL returned from the server");
    }
  } catch (error) {
    console.error("Error redirecting to customer portal:", error);
    throw error;
  }
};
