import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Logo from "../assets/CaseMap logo.png";
import LogoTransparent from "../assets/CaseMap logo.png";
import { useTranslation } from "react-i18next";
import { registerUser, signInWithGoogle } from "../services/api";

function Signup() {
  const { i18n, t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [askOTP, setAskOTP] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await registerUser(formData.email, formData.password, formData.fullName);
      if (response.success) {
        toast.success("Account created successfully!");
        navigate("/chat");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join("")); // Update the main OTP state

    // Auto-focus next input
    if (value !== "" && index < 3) {
      const nextInput = document.querySelector(
        `input[name='otp-${index + 1}']`
      );
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[name='otp-${index - 1}']`
      );
      if (prevInput) {
        prevInput.focus();
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = "";
        setOtpValues(newOtpValues);
        setOtp(newOtpValues.join(""));
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const response = await signInWithGoogle();
      if (response.success) {
        toast.success("Account created successfully!");
        navigate("/chat");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error signing up with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={Logo} alt="CaseMap logo" />
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {t("signup.createAccountHeading")}
            </h1>
            <p className="text-white text-xl">{t("signup.description")}</p>
          </motion.div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:rounded-l-3xl">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-self-end sm:fixed top-6 right-6 mb-6">
              <select
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-white border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="en">{t("language.en")}</option>
                <option value="fr">{t("language.fr")}</option>
              </select>
            </div>
            <img
              src={LogoTransparent}
              alt="Logo"
              className="h-10 w-30 mx-auto lg:hidden"
            />
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t("signup.createAccount")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                {t("signup.googleLogin")}
                {isLoading && (
                  <span className="w-3 h-3 ml-2 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("signup.fullName")}
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("signup.emailAddress")}
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("signup.password")}
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              {!askOTP && (
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {t("signup.createAccount")}{" "}
                  {isLoading && (
                    <span className="w-5 h-5 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                </button>
              )}
            </form>
            {askOTP && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    {t("Enter Verification Code")}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {t("We've sent a code to")} {formData.email}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      name={`otp-${index}`}
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  ))}
                </div>

                {otp.length === 4 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleOTPVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      t("Verify")
                    )}
                  </motion.button>
                )}
              </motion.div>
            )}
            <p className="mt-4 text-center text-sm text-gray-600">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-primary hover:text-primary/90">
                {t("signup.login")}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Signup;