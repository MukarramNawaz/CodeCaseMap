import { useState, useEffect, useRef } from "react";
import { EyeIcon, EyeOffIcon, PencilIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../../features/userSlice";
import { updateUserInfoApi } from "../../services/api";
import toast from "react-hot-toast";

export default function ProfileSettings({ onClose }) {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [name, setName] = useState(userInfo?.name);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(userInfo?.profile_picture);
  const [actualImageFile, setActualImageFile] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPopUp, setIsPopUp] = useState(false);
  const fileInputRef = useRef(null);

  const base64ToFile = async (base64String) => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], "profile-image", { type: blob.type });
  };

  const handleUpdateName = (newName) => {
    dispatch(updateUserInfo({ name: newName }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result); // For preview only
        setActualImageFile(file); // Store the actual file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // If there's a new image, pass the actual file
      const imageToUpload =
        actualImageFile ||
        (profileImage !== userInfo?.profile_picture
          ? await base64ToFile(profileImage)
          : null);
      const response = await updateUserInfoApi(
        name,
        userInfo?.email,
        imageToUpload
      );

      if (!response.success) {
        setName(userInfo?.name);
        toast.error(response.message);
        return;
      }

      dispatch(
        updateUserInfo({
          name: name,
          profile_picture: response.data.profile_picture,
        })
      );
      setIsPopUp(true);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleGoHome = () => {
    onClose();
    setIsPopUp(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Profile Section */}
        <div className="flex flex-col overflow-y-auto sm:flex-row items-start sm:items-center gap-4 mb-4 border-b pb-4">
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
              onClick={handleImageClick}
            />
            <button
              className="absolute bottom-0 right-0 p-1 bg-white rounded-full border shadow-sm"
              onClick={handleImageClick}
            >
              <PencilIcon className="w-3 h-3" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-medium">{userInfo?.name}</h2>
            <p className="text-gray-500 text-sm">{userInfo?.email}</p>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xl font-medium"> {t("settings.name")}</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-full"
                onBlur={() => setIsEditing(false)}
                autoFocus
              />
            ) : (
              <div
                className="w-full py-2 px-4 border rounded-3xl cursor-pointer hover:bg-gray-50"
                onClick={() => setIsEditing(true)}
              >
                {name}
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-2">
                {" "}
                {t("settings.oldPassword")}
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full py-2 px-3 border rounded-3xl pr-10"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-[#A7A3FF]" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-[#A7A3FF]" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                {t("settings.newPassword")}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-2 px-3 border rounded-3xl pr-10"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-[#A7A3FF]" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-[#A7A3FF]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveChanges}
          className=" px-7 bg-primary text-white py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          {t("settings.saveChanges")}
        </button>
      </div>
      {isPopUp && (
        <div className="fixed inset-0  flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-11/12 md:max-w-md md:w-full p-6 rounded-xl shadow-lg animate-slide-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg  text-gray-800">
                {t("settings.profileUpdated")}
              </h2>
              <button
                onClick={() => setIsPopUp(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={handleGoHome}
                className="bg-primary text-white px-8 py-2 rounded-3xl hover:bg-zinc-700 focus:outline-none"
              >
                {t("settings.goToHome")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}