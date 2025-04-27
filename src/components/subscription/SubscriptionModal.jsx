// import { useState, Fragment, useEffect } from "react";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { XMarkIcon } from "@heroicons/react/24/outline";
// import PricingCard from "./PricingCard";
// import { useTranslation } from "react-i18next";
// import { getPlans } from "../../services/api";

// function SubscriptionModal({ isOpen, onClose }) {
//   const { t } = useTranslation();
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [plans, setPlans] = useState({ monthly: [], yearly: [] });

//   useEffect(() => {
//     const fetchPlans = async () => {
//       const data = await getPlans();
//       setPlans(data);
//       setSelectedPlan(data.monthly[0].name);
//     };
//     fetchPlans();
//   }, []);
//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/60" />
//         </TransitionChild>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <TransitionChild
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <DialogPanel className="w-full max-w-[1200px] transform overflow-hidden rounded-3xl bg-gray-50 p-4 sm:p-6 md:p-8 shadow-xl transition-all">
//                 <div className="text-center mb-4 relative">
//                   <div>
//                     <DialogTitle
//                       as="h2"
//                       className="text-2xl sm:text-3xl font-bold mb-2"
//                     >
//                       {t("upgradePlan.upgradePlan")}
//                     </DialogTitle>
//                     <p className="text-sm sm:text-base text-gray-500">
//                       {t("upgradePlan.choosePlan")}
//                     </p>
//                   </div>
//                   <button
//                     onClick={onClose}
//                     className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 absolute top-0 right-0 sm:top-2 sm:right-2"
//                   >
//                     <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
//                   </button>
//                 </div>

//                 <div className="flex justify-center mb-8 sm:mb-12">
//                   <div className="inline-flex p-1 rounded-xl bg-white shadow-sm">
//                     <button
//                       className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
//                         billingCycle === "monthly"
//                           ? "bg-black text-white"
//                           : "text-gray-600 hover:bg-gray-50"
//                       }`}
//                       onClick={() => setBillingCycle("monthly")}
//                     >
//                       {t("upgradePlan.monthly")}
//                     </button>
//                     <button
//                       className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
//                         billingCycle === "yearly"
//                           ? "bg-black text-white"
//                           : "text-gray-600 hover:bg-gray-50"
//                       }`}
//                       onClick={() => setBillingCycle("yearly")}
//                     >
//                       {t("upgradePlan.yearly")}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-6">
//                   {plans &&
//                     plans[billingCycle].map((plan) => (
//                       <PricingCard
//                         key={plan.name}
//                         plan={plan}
//                         billingCycle={billingCycle}
//                         isSelected={selectedPlan === plan.name}
//                         onSelect={() => setSelectedPlan(plan.name)}
//                       />
//                     ))}
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

// export default SubscriptionModal;


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

// Mock data for subscription plans
const mockPlans = {
  monthly: [
    {
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
                      {t("upgradePlan.upgradePlan")}
                    </DialogTitle>
                    <p className="text-sm sm:text-base text-gray-500">
                      {t("upgradePlan.choosePlan")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mb-8 sm:mb-12">
                  <div className="inline-flex p-1 rounded-xl bg-white shadow-sm">
                    <button
                      className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        billingCycle === "monthly"
                          ? "bg-tertiary text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      {t("upgradePlan.monthly")}
                    </button>
                    <button
                      className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        billingCycle === "yearly"
                          ? "bg-tertiary text-white"
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