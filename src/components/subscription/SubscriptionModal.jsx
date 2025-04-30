import { useState, Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import PricingCard from "./PricingCard";
import { useTranslation } from "react-i18next";

import { useSelector } from "react-redux";

// Mock data for subscription plans
const mockPlans = {
  monthly: [
    {
      id: "prod_SCyIl8e2WSsQA2",
      name: "Basic",
      price: 0,
      features: [
        "5 AI queries per day",
        "Basic document analysis",
        "Access to case library",
        "24/7 support",
        "Limited export options",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA1",
      name: "Pro",
      price: 39.99,
      features: [
        "100 AI queries per day",
        "Advanced document analysis",
        "Full case library access",
        "Priority support",
        "All export options",
        "Custom case templates",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA3",
      name: "Business",
      price: 99.99,
      features: [
        "Unlimited AI queries",
        "Enterprise-grade document analysis",
        "Full case library access",
        "Priority support with dedicated manager",
        "All export options",
        "Custom case templates",
        "Team collaboration features",
        "Advanced analytics dashboard",
      ],
    },
  ],
  yearly: [
    {
      id: "prod_SCyIl8e2WSsQA2",
      name: "Basic",
      price: 0,
      features: [
        "5 AI queries per day",
        "Basic document analysis",
        "Access to case library",
        "24/7 support",
        "Limited export options",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA1",
      name: "Pro",
      price: 29.99,
      features: [
        "100 AI queries per day",
        "Advanced document analysis",
        "Full case library access",
        "Priority support",
        "All export options",
        "Custom case templates",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA3",
      name: "Business",
      price: 79.99,
      features: [
        "Unlimited AI queries",
        "Enterprise-grade document analysis",
        "Full case library access",
        "Priority support with dedicated manager",
        "All export options",
        "Custom case templates",
        "Team collaboration features",
        "Advanced analytics dashboard",
      ],
    },
  ],
};

function SubscriptionModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState(mockPlans);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user data from Redux store
  const { userInfo } = useSelector((state) => state.user);
  const hasActiveSubscription = userInfo?.hasActiveSubscription || false;
  const subscriptionData = userInfo?.subscription || null;

  // useEffect(() => {
  //   const fetchPlans = async () => {
  //     try {
  //       if (useMockData) {
  //         setPlans(mockPlans);
  //         setSelectedPlan(mockPlans.monthly[0].name);
  //         return;
  //       }

  //       const data = await getPlans();
  //       setPlans(data);
  //       setSelectedPlan(data.monthly[0].name);
  //     } catch (error) {
  //       console.error("Failed to fetch plans, using mock data:", error);
  //       // Fallback to mock data if API fails
  //       setPlans(mockPlans);
  //       setSelectedPlan(mockPlans.monthly[0].name);
  //     }
  //   };
  //   fetchPlans();
  // }, [useMockData]);

  useEffect(() => {
    if (plans && plans[billingCycle]) {
      setSelectedPlan(plans[billingCycle][0].id);
    }
  }, [billingCycle]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white z-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto bg-white z-50">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[60] p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <div className="flex min-h-screen items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[1200px] transform overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 transition-all">
                <div className="text-center mb-4 relative">
                  <div>
                    <DialogTitle
                      as="h2"
                      className="text-2xl sm:text-3xl font-bold mb-2"
                    >
                      {hasActiveSubscription 
                        ? t("upgradePlan.yourSubscription") 
                        : t("upgradePlan.upgradePlan")}
                    </DialogTitle>
                    {hasActiveSubscription ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center text-tertiary">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <p className="text-sm sm:text-base font-medium">
                            {t("upgradePlan.activeSubscription")}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {subscriptionData?.planDetails?.name && (
                            <span className="font-medium">{subscriptionData.planDetails.name} Plan</span>
                          )}
                          {subscriptionData?.expiresAt && (
                            <span> · {t("upgradePlan.renewsOn")} {new Date(subscriptionData.expiresAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-gray-500">
                        {t("upgradePlan.choosePlan")}
                      </p>
                    )}
                  </div>
                </div>

                {!hasActiveSubscription ? (
                  <>
                    <div className="flex justify-center mb-8 sm:mb-12">
                      <div className="inline-flex p-1 rounded-xl bg-white shadow-sm">
                        <button
                          className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                            billingCycle === "monthly"
                              ? "bg-tertiary text-white"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            if (billingCycle !== "monthly") {
                              setIsLoading(true);
                              setTimeout(() => {
                                setBillingCycle("monthly");
                                setIsLoading(false);
                              }, 500);
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading && billingCycle !== "monthly" ? (
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : null}
                          {t("upgradePlan.monthly")}
                        </button>
                        <button
                          className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                            billingCycle === "yearly"
                              ? "bg-tertiary text-white"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            if (billingCycle !== "yearly") {
                              setIsLoading(true);
                              setTimeout(() => {
                                setBillingCycle("yearly");
                                setIsLoading(false);
                              }, 500);
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading && billingCycle !== "yearly" ? (
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : null}
                          {t("upgradePlan.yearly")}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-6">
                      {plans &&
                        plans[billingCycle].map((plan) => (
                          <PricingCard
                            key={plan.name}
                            plan={plan}
                            billingCycle={billingCycle}
                            isSelected={selectedPlan === plan.name}
                            onSelect={() => setSelectedPlan(plan.name)}
                          />
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-50 rounded-xl p-6 max-w-md w-full mb-6">
                      <h3 className="text-lg font-medium mb-2">{t("upgradePlan.currentPlan")}</h3>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-xl font-bold text-tertiary">
                            {subscriptionData?.planDetails?.name || "Premium"} Plan
                          </p>
                          <p className="text-sm text-gray-500">
                            {subscriptionData?.current_period_end ? (
                              <span>{t("upgradePlan.nextBillingDate")}: {new Date(subscriptionData.current_period_end).toLocaleDateString()}</span>
                            ) : (
                              <span>{t("upgradePlan.activeUntilCanceled")}</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-tertiary text-white text-xs font-medium px-3 py-1 rounded-full">
                          {t("upgradePlan.active")}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button className="w-full py-2 rounded-xl font-medium bg-white border border-tertiary text-tertiary hover:bg-gray-50 transition-colors duration-200">
                          {t("upgradePlan.manageBilling")}
                        </button>
                        <button className="w-full py-2 rounded-xl font-medium bg-white border border-red-500 text-red-500 hover:bg-red-50 transition-colors duration-200">
                          {t("upgradePlan.cancelSubscription")}
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 max-w-md text-center">
                      {t("upgradePlan.subscriptionNote")}
                    </p>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SubscriptionModal;
