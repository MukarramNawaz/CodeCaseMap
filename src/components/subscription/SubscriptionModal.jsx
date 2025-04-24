import { useState, Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PricingCard from "./PricingCard";
import { useTranslation } from "react-i18next";
import { getPlans } from "../../services/api";

function SubscriptionModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState({ monthly: [], yearly: [] });

  useEffect(() => {
    const fetchPlans = async () => {
      const data = await getPlans();
      setPlans(data);
      setSelectedPlan(data.monthly[0].name);
    };
    fetchPlans();
  }, []);
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
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
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
              <DialogPanel className="w-full max-w-[1200px] transform overflow-hidden rounded-3xl bg-gray-50 p-4 sm:p-6 md:p-8 shadow-xl transition-all">
                <div className="text-center mb-4 relative">
                  <div>
                    <DialogTitle
                      as="h2"
                      className="text-2xl sm:text-3xl font-bold mb-2"
                    >
                      {t("upgradePlan.upgradePlan")}
                    </DialogTitle>
                    <p className="text-sm sm:text-base text-gray-500">
                      {t("upgradePlan.choosePlan")}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 absolute top-0 right-0 sm:top-2 sm:right-2"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="flex justify-center mb-8 sm:mb-12">
                  <div className="inline-flex p-1 rounded-xl bg-white shadow-sm">
                    <button
                      className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        billingCycle === "monthly"
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      {t("upgradePlan.monthly")}
                    </button>
                    <button
                      className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        billingCycle === "yearly"
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setBillingCycle("yearly")}
                    >
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
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SubscriptionModal;
