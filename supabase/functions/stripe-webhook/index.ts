import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@13.11.0';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
});
const cryptoProvider = Stripe.createSubtleCryptoProvider(); // WebCrypto for Deno
const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
Deno.serve(async (req)=>{
  // Verify Stripe signature
  const signature = req.headers.get('Stripe-Signature') || '';
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || '', undefined, cryptoProvider);
    console.log(`✅ Webhook verified: ${event.id}`);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400
    });
  }
  // Handle relevant events
  try {
    switch(event.type){
      case 'checkout.session.completed':
        {
          const session = event.data.object;
          console.log('Checkout session completed:', session.id);
          break;
        }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object;
          console.log('Subscription created/updated:', subscription.id);
          const metadata = subscription.metadata;
          await supabase.from('subscriptions').upsert({
            stripe_subscription_id: subscription.id,
            user_id: metadata.user_id,
            plan_id: metadata.plan_id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            current_period_end: new Date(subscription.items.data[0].current_period_end * 1000),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
            updated_at: new Date()
          });
          break;
        }
      case 'invoice.payment_succeeded':
        {
          const invoice = event.data.object;
          console.log('Invoice payment succeeded:', invoice.id);
          const { user_id, plan_id } = invoice.parent.subscription_details.metadata;
          if (!user_id || !plan_id) {
            console.error('Missing metadata on invoice:', invoice.id);
            return new Response('Missing metadata', {
              status: 400
            });
          }
          await supabase.from('subscriptions').upsert({
            stripe_subscription_id: invoice.parent.subscription_details.subscription,
            user_id: user_id,
            plan_id: plan_id,
            stripe_customer_id: invoice.customer,
            status: invoice.status,
            current_period_end: new Date(invoice.lines.data[0].period.end * 1000),
            updated_at: new Date()
          });
          break;
        }
      case 'customer.subscription.deleted':
        {
          const deleted = event.data.object.id;
          console.log('Subscription deleted:', deleted);
          await supabase.from('subscriptions').delete().match({
            stripe_subscription_id: deleted
          });
          break;
        }
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Internal handler error:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
