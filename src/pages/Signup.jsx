import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Logo from "../assets/CaseMap logo.png";
import LogoTransparent from "../assets/CaseMap logo.png";
import SignupBG from "../assets/SignupBG.jpg";
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
      const response = await registerUser(
        formData.email,
        formData.password,
        formData.fullName
      );
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
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={SignupBG}
            alt="Signup Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center h-full bg-white overflow-hidden">
        <div className="max-w-md w-full sm:max-w-lg md:max-w-2xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* <div className="flex justify-self-end sm:fixed top-6 right-6 mb-6">
              <select
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-tertiary transition-all"
              >
                <option value="en">{t("language.en")}</option>
                <option value="fr">{t("language.fr")}</option>
              </select>
            </div> */}
            <img
              src={LogoTransparent}
              alt="Logo"
              className="h-16 sm:h-20 md:h-24 mx-auto mb-2 sm:mb-4"
            />
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-lg">
              <h2 className="text-xl sm:text-2xl md:text-3xl text-tertiary font-bold mb-2 sm:mb-4 text-center">
                {t("signup.createAccount")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
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

                {/* Full-width Name Input */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t("signup.fullName")}
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                {/* Full-width Email Input */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t("signup.emailAddress")}
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* Two-column Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      {t("signup.password")}
                    </label>
                    <input
                      type="password"
                      required
                      className="mt-1 block w-full px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      {t("signup.reEnterPassword") || "Re-enter Password"}
                    </label>
                    <input
                      type="password"
                      required
                      className="mt-1 block w-full px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                      onChange={(e) => {
                        // You can add password confirmation validation here
                        if (e.target.value !== formData.password) {
                          // Handle password mismatch
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative inline-block">
                      <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="remember"
                        className="flex items-center cursor-pointer w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-tertiary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"
                      ></label>
                    </div>
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {t("login.rememberMe")}
                    </label>
                  </div>
                </div>

                {!askOTP && (
                  <button
                    type="submit"
                    className="w-full py-1.5 sm:py-2 px-4 border border-transparent rounded-xl shadow-sm text-base sm:text-lg font-medium text-white bg-tertiary hover:bg-tertiary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
                  >
                    {t("signup.createAccount")}{" "}
                    {isLoading && (
                      <span className="w-5 h-5 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                  </button>
                )}
              </form>
            </div>
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
                      className="w-12 h-12 text-center text-xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
                    />
                  ))}
                </div>

                {otp.length === 4 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleOTPVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-tertiary hover:bg-tertiary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
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
            <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="text-tertiary hover:text-tertiary/90"
              >
                {t("signup.login")}
              </Link>
            </p>
          </motion.div>

          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <a href="" className="text-tertiary hover:text-tertiary/90">
              privacy policy
            </a>{" "}
            and{" "}
            <a href="" className="text-tertiary hover:text-tertiary/90">
              terms of service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
