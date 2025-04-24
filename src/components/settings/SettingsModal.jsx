import { useState, Fragment } from "react";
import {
  Dialog,
  Tab,
  Transition,
  TabGroup,
  TabList,
  TabPanel,
  TransitionChild,
  DialogPanel,
  DialogTitle,
  TabPanels,
} from "@headlessui/react";
import {
  XMarkIcon,
  Cog8ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import GeneralSettings from "./GeneralSettings";
import ProfileSettings from "./ProfileSettings";
import { useTranslation } from "react-i18next";

function SettingsModal({ isOpen, onClose, defaultTab = 0 }) {
  const { t } = useTranslation();
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
          <div className="fixed inset-0 bg-primary bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="flex justify-between items-center px-6 py-2 border-b">
                  <DialogTitle as="h3" className="text-2xl font-bold">
                    {t("settings.settings")}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <TabGroup
                  className="flex min-h-[500px]"
                  defaultIndex={defaultTab}
                >
                  <TabList className="p-4 border-r border-gray-200">
                    <Tab
                      className={({ selected }) =>
                        `px-2 sm:px-6 py-2 rounded-lg flex items-center   ${
                          selected
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:text-gray-800"
                        }`
                      }
                    >
                      <Cog8ToothIcon className="h-6 w-6" />
                      <p className="ml-2 hidden sm:block">
                        {" "}
                        {t("settings.general")}
                      </p>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `px-2 sm:px-6 py-2 rounded-lg flex items-center ${
                          selected
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:text-gray-800"
                        }`
                      }
                    >
                      <UserIcon className="h-6 w-6" />
                      <p className="ml-2 hidden sm:block">
                        {" "}
                        {t("settings.profile")}
                      </p>
                    </Tab>
                  </TabList>
                  <TabPanels className="p-6 w-full">
                    <TabPanel>
                      <GeneralSettings />
                    </TabPanel>
                    <TabPanel>
                      <ProfileSettings onClose={onClose} />
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SettingsModal;