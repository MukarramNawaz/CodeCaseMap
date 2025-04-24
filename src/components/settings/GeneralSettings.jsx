import { useState } from "react";
import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { logoutUser, deleteAllConversations } from "../../services/api";
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

function GeneralSettings() {
  const { i18n, t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };
  const [language, setLanguage] = useState("auto");
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDeleteAllChats = async () => {
    try {
      const response = await deleteAllConversations();
      toast.success("All chats deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Error deleting chats");
    }
  };

  const handleLogout = async () => {
    const logoutResponse = await logoutUser();
    if (logoutResponse.error) {
      toast.error(logoutResponse.error);
      return;
    }
    navigate("/login");
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="block text-sm font-medium text-gray-700">
          {t("settings.language")}
        </label>
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="px-3 py-2 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="en">{t("language.en")}</option>
          <option value="fr">{t("language.fr")}</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p>{t("settings.deleteAllChats")}</p>
        <button
          onClick={() => setIsDeleteOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 whitespace-nowrap"
        >
          {t("settings.deleteAll")}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p>{t("settings.logoutDevice")}</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 border border-gray-200 text-primary rounded-full hover:ring-primary hover:border-primary whitespace-nowrap"
        >
          {t("settings.logout")}
        </button>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:max-w-md md:w-full p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("settings.deleteChatsConfirmation")}
              </h2>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className=" text-gray-700 px-10 py-2 rounded-3xl hover:bg-gray-200 focus:outline-none border border-gray-400"
              >
                {t("settings.cancel")}
              </button>
              <button
                className="bg-red-500 text-white px-10 py-2 rounded-3xl hover:bg-red-600 focus:outline-none"
                onClick={handleDeleteAllChats}
              >
                {t("settings.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneralSettings;