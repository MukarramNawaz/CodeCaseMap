import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@13.11.0';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
});
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { planId, billingCycle } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }
    // Get plan details
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
    if (!plan) {
      throw new Error('Plan not found');
    }
    // Create or retrieve Stripe customer
    let { data: subscription } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    let customerId = subscription?.stripe_customer_id;
    if (!customerId) {
      const { data: userData } = await supabase.from('users').select('email, name').eq('id', user.id).single();
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
    }
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: billingCycle === 'yearly' ? plan.stripe_price_yearly : plan.stripe_price_monthly,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/chat?success=true`,
      cancel_url: `${req.headers.get('origin')}/chat?canceled=true`,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId
        }
      }
    });
    return new Response(JSON.stringify({
      session
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
