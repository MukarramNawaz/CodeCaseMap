import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@13.11.0";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16"
});
const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: corsHeaders
    });
  }
  try {
    // Get the request body
    const { customerId, returnUrl } = await req.json();
    if (!customerId) {
      return new Response(JSON.stringify({
        error: "Customer ID is required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || Deno.env.get("SITE_URL")
    });
    // Return the session URL
    return new Response(JSON.stringify({
      url: session.url
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
