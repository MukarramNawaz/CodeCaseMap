import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../../features/userSlice";
import { updateUserInfoApi } from "../../services/api";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import profileBgGradient from "../../assets/profile-bg-gradient.png";

export default function AccountSettings({ onClose, isSidebarOpen, sidebarWidth }) {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // User information states
  const [fullName, setFullName] = useState(userInfo?.name || "");
  const [email] = useState(userInfo?.email || "");
  const [contactNo, setContactNo] = useState(userInfo?.phone || "");
  const [age, setAge] = useState(userInfo?.age || "");
  const [gender, setGender] = useState(userInfo?.gender || "Male");
  const [maritalStatus, setMaritalStatus] = useState(userInfo?.maritalStatus || "Single");
  const [about, setAbout] = useState(userInfo?.about || "");
  
  // Profile image state
  const [profileImage, setProfileImage] = useState(userInfo?.profile_picture);
  const [actualImageFile, setActualImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const base64ToFile = async (base64String) => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], "profile-image", { type: blob.type });
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
          
      const userData = {
        name: fullName,
        email: email,
        phone: contactNo,
        age: age,
        gender: gender,
        maritalStatus: maritalStatus,
        about: about
      };
      
      const response = await updateUserInfoApi(
        fullName,
        email,
        imageToUpload,
        userData
      );

      if (!response.success) {
        toast.error(response.message || "Failed to update profile");
        return;
      }

      dispatch(
        updateUserInfo({
          name: fullName,
          email: email,
          phone: contactNo,
          age: age,
          gender: gender,
          maritalStatus: maritalStatus,
          about: about,
          profile_picture: response.data.profile_picture,
        })
      );
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 pt-4 pb-16">
        <div className="flex flex-col max-w-6xl mx-auto">
        <div className="absolute top-0 right-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Left column - Profile image */}
          <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="bg-white/50 p-4 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center rounded-lg bg-white overflow-hidden">
              {/* Gradient top section */}
              <div 
                className="w-full h-20 relative rounded-lg"
                style={{
                  backgroundImage: `url(${profileBgGradient})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top'
                }}
              ></div>
              
              {/* Profile content section */}
              <div className="flex flex-col items-center px-4 pb-4 w-full -mt-12">
                <div className="relative mb-2">
                  <img
                    src={profileImage || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    onClick={handleImageClick}
                  />
                  <div className="absolute -bottom-1 w-full text-center">
                    <span className="bg-yellow-400 text-white px-2 py-0.5 text-xs rounded-full font-medium">Premium</span>
                  </div>
                </div>
                <h3 className="font-medium text-lg text-gray-800 mt-3">{fullName}</h3>
                <p className="text-gray-500 text-sm">{email}</p>
              </div>
            </div>
          </div>
          </div>
          
          {/* Right column - Form fields */}
          <div className="w-full md:w-2/3 bg-white/50 p-4 sm:p-6 rounded-2xl shadow-lg">
          <div className="mb-6 flex flex-col items-start gap-1 leading-none">
            <h2 className="text-2xl font-bold text-[#004D40]">Account Settings</h2>
            <p className="text-gray-500 text-sm">Here you can change user account information</p>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {/* Full Name - full width */}
              <div className="col-span-1 sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                  placeholder="Mubashir Smith"
                />
              </div>
              
              {/* Email Address - half width */}
              <div className="col-span-1 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary bg-gray-50"
                  placeholder="abcdmubashir123@gmail.com"
                />
              </div>
              
              {/* Contact Number - half width */}
              <div className="col-span-1 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                  placeholder="+92 343434334"
                />
              </div>
              
              {/* Age - one-third width */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                  placeholder="32"
                />
              </div>
              
              {/* Gender - one-third width */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Marital Status - one-third width */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              
              {/* About - full width */}
              <div className="col-span-1 sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary"
                  placeholder="Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took"
                />
              </div>
            </div>
            
            {/* Hidden file input for profile image */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            
            {/* Save Changes Button */}
            <div className="mt-6 sm:col-span-6">
              <button
                onClick={handleSaveChanges}
                className="w-full bg-tertiary text-white py-3 rounded-xl hover:bg-tertiary/80 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
          </div>
      </div>
    </div>
  );
}
