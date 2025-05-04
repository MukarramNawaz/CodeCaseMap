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
import { redirectToCustomerPortal } from "../../lib/stripe";

import { useSelector } from "react-redux";

// Mock data for subscription plans
const mockPlans = {
  monthly: [
    {
      id: "prod_SCyIl8e2WSsQA2",
      name: "Free 7 day trial to Lite",
      price: 0,
      features: ["Free 7 day trial to Lite"],
    },
    {
      id: "prod_SCyIl8e2WSsQA1",
      name: "Strategic Lite",
      price: 27,
      features: [
        "Access to our Basic GPT tool to outline your case",
        "DIY prompt library to help you write, organize, and respond",
        "One core case map template to plot your legal path",
        "Our 'Pro Se Readt?' checklist to avoid beginner pitfalls",
        "Community access for peer insight and support",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA3",
      name: "Tactical Builder",
      price: 77,
      features: [
        "Everything in Lite, plus:",
        "Advanced prompt packs organized by case stage",
        "Case strategy Builder Tool for high-impact planning",
        "Document Toolkit to get your drafts AI-generated",
        "Workshop replay access: 'AI for Family Court Success'",
        "Live group coaching once a month",
        // "Courtroom Prep Prompt Pack",
        // "VIP invite to quarterly live 'Ask me Anything' coaching calls",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA4",
      name: "Litigant Elite",
      price: 147,
      features: [
        "Everything in Tactical Builder, plus:",
        "GPT Premium Mode: advanced logic, naunce and planning",
        "Evidance & Judge Tracker: upload, tag, analyze",
        "Real-time GPT support-no waiting for custom prompts",
        "1 monthly strategy review from a CaseMap Expert",
        "Litigant Lab Monthly: high-level group coaching",
        "Exclusive vault of scripts, pleadings, arguments, and cross-exam guides",
        // "Courtroom Prep Prompt Pack",
        // "VIP invite to quarterly live 'Ask me Anything' coaching calls",
      ],
    },
  ],
  yearly: [
    {
      id: "prod_SCyIl8e2WSsQA2",
      name: "Free 7 day trial to Lite",
      price: 0,
      features: ["Free 7 day trial to Lite"],
    },
    {
      id: "prod_SCyIl8e2WSsQA1",
      name: "Strategic Lite",
      price: 27,
      features: [
        "Access to our Basic GPT tool to outline your case",
        "DIY prompt library to help you write, organize, and respond",
        "One core case map template to plot your legal path",
        "Our 'Pro Se Readt?' checklist to avoid beginner pitfalls",
        "Community access for peer insight and support",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA3",
      name: "Tactical Builder",
      price: 77,
      features: [
        "Everything in Lite, plus:",
        "Advanced prompt packs organized by case stage",
        "Case strategy Builder Tool for high-impact planning",
        "Document Toolkit to get your drafts AI-generated",
        "Workshop replay access: 'AI for Family Court Success'",
        "Live group coaching once a month",
      ],
    },
    {
      id: "prod_SCyIl8e2WSsQA4",
      name: "Litigant Elite",
      price: 147,
      features: [
        "Everything in Tactical Builder, plus:",
        "GPT Premium Mode: advanced logic, naunce and planning",
        "Evidance & Judge Tracker: upload, tag, analyze",
        "Real-time GPT support-no waiting for custom prompts",
        "1 monthly strategy review from a CaseMap Expert",
        "Litigant Lab Monthly: high-level group coaching",
        "Exclusive vault of scripts, pleadings, arguments, and cross-exam guides",
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
  const [isBillingLoading, setIsBillingLoading] = useState(false);

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
              <DialogPanel className="w-full max-w-[1600px] transform overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 transition-all">
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
                            <span className="font-medium">
                              {subscriptionData.planDetails.name} Plan
                            </span>
                          )}
                          {subscriptionData?.expiresAt && (
                            <span>
                              {" "}
                              · {t("upgradePlan.renewsOn")}{" "}
                              {new Date(
                                subscriptionData.expiresAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm sm:text-base text-gray-500">
                          {t("upgradePlan.choosePlan")}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500">
                          {t("upgradePlan.feelFree")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <>
                  {/* Current plan indicator and small manage button */}
                  {hasActiveSubscription && (
                    <div className="flex justify-center items-center mb-4">
                      <div className="flex items-center bg-tertiary/10 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-medium text-tertiary mr-2">
                          {t("upgradePlan.currentPlan")}:
                          <span className="font-bold ml-1">
                            {subscriptionData?.planDetails?.name || "Premium"}
                          </span>
                        </span>
                        <div className="h-4 w-px bg-tertiary/30 mx-2"></div>
                        <button
                          onClick={() => {
                            if (
                              subscriptionData?.stripe_customer_id &&
                              !isBillingLoading
                            ) {
                              setIsBillingLoading(true);
                              try {
                                redirectToCustomerPortal(
                                  subscriptionData.stripe_customer_id
                                ).catch((error) => {
                                  console.error(
                                    "Error redirecting to customer portal:",
                                    error
                                  );
                                  toast.error("Failed to open billing portal");
                                  setIsBillingLoading(false);
                                });

                                // Set a timeout to reset the loading state in case the redirect doesn't happen
                                // This is a fallback since the page will navigate away on success
                                setTimeout(
                                  () => setIsBillingLoading(false),
                                  5000
                                );
                              } catch (error) {
                                console.error(
                                  "Error in customer portal redirect:",
                                  error
                                );
                                setIsBillingLoading(false);
                              }
                            }
                          }}
                          disabled={isBillingLoading}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors duration-200 flex items-center justify-center min-w-[90px] ${
                            isBillingLoading
                              ? "bg-tertiary/80"
                              : "bg-tertiary hover:bg-tertiary/90"
                          } text-white`}
                        >
                          {isBillingLoading ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span>Loading...</span>
                            </>
                          ) : (
                            t("upgradePlan.manageBilling")
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg mb-3 w-fit">
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
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
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
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : null}
                        {t("upgradePlan.yearly")}
                      </button>
                    </div>
                    {billingCycle === "yearly" && (
                      <div>
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5.586a1 1 0 01.707.293l1 1a1 1 0 001.414 0l1-1A1 1 0 0113.414 4H19a1 1 0 011 1v5c0 .256-.098.512-.293.707z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Save 10% with yearly billing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full mt-6">
                    {plans &&
                      plans[billingCycle].map((plan) => (
                        <PricingCard
                          key={plan.name}
                          plan={plan}
                          billingCycle={billingCycle}
                          isSelected={selectedPlan === plan.name}
                          onSelect={() => setSelectedPlan(plan.name)}
                          isCurrentPlan={
                            hasActiveSubscription &&
                            (subscriptionData?.plan_id === plan.id || subscriptionData?.planDetails?.id === plan.id)
                          }
                        />
                      ))}
                  </div>
                </>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SubscriptionModal;
