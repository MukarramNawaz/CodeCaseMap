import React, { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline"; 
import { getStripe } from "../../lib/stripe";
import { supabase } from "../../services/supabaseClient";
import toast from "react-hot-toast";

async function createCheckoutSession(planId, billingCycle) {
  try {
    const { data: { session } } = await supabase.functions.invoke('create-checkout-session', {
      body: { planId, billingCycle }
    });

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
    
    if (error) {
      toast.error(error.message);
    }
  } catch (err) {
    toast.error('Failed to initiate checkout');
  }
}

function PricingCard({ plan, billingCycle, isSelected, onSelect }) {
  const isPro = plan.name === "Pro";
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    console.log('Subscribing with plan ID:', plan.id, 'billing cycle:', billingCycle);
    await createCheckoutSession(plan.id, billingCycle);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('PricingCard rendered with:', {
      planId: plan.id,
      planName: plan.name,
      isSelected,
      billingCycle
    });
  }, [plan, isSelected, billingCycle]);

  return (
    <div
      className={`w-full sm:max-w-[360px] flex flex-col transform transition-all duration-300 ease-in-out ${
        isSelected ? "scale-105 shadow-2xl" : "hover:scale-105 hover:shadow-xl"
      } ${
        isSelected
          ? "bg-tertiary text-white"
          : isPro
          ? "bg-gray-900 text-white"
          : "bg-white"
      } p-6 sm:p-8 rounded-3xl shadow-lg border-2 ${
        isSelected
          ? "border-white"
          : isPro
          ? "border-gray-800"
          : "border-gray-100"
      }`}
      onClick={onSelect}
    >
      <div className="flex-grow">
        <h3 className="text-xl sm:text-2xl font-semibold mb-2">
          {plan.name} Plan
        </h3>
        <p
          className={`text-xs sm:text-sm ${
            isSelected ? "text-gray-300" : "text-gray-500"
          } mb-6`}
        >
          {plan.name === "Basic" &&
            "Individuals or small businesses just starting with HR needs."}
          {plan.name === "Pro" &&
            "Growing businesses and HR professionals needing more comprehensive support."}
          {plan.name === "Business" &&
            "Large organizations or companies with complex HR needs."}
        </p>
        <div className="mb-8">
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl font-bold">
              ${plan.price}
            </span>
            <span
              className={`ml-2 text-sm sm:text-base ${
                isSelected
                  ? "text-gray-300"
                  : isPro
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              /{billingCycle}
            </span>
          </div>
          {isPro && billingCycle === "yearly" && (
            <span className="inline-block mt-2 px-3 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded-full">
              Save $50 a year
            </span>
          )}
        </div>
        <ul className="space-y-3 sm:space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full ${
                  isSelected ? "bg-gray-800" : "bg-tertiary"
                } flex items-center justify-center`}
              >
                <CheckIcon className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs sm:text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={`w-full py-2 sm:py-3 rounded-xl font-medium transition-colors duration-200 ${
          isSelected
            ? "bg-white text-tertiary hover:bg-gray-100"
            : isPro
            ? "bg-white text-tertiary hover:bg-gray-100"
            : "bg-tertiary text-white hover:bg-gray-900"
        }`}
      >
        {isPro
          ? "Go to pro"
          : plan.name === "Basic"
          ? "Signup for free"
          : isLoading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  );
}

export default PricingCard;