import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Logo from "../assets/CaseMap logo.png";
import LoginBG from "../assets/LoginBG.jpg";
import { useTranslation } from "react-i18next";
import { requestPasswordReset } from "../services/api";

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent to your email");
      } else {
        toast.error(response.message || "Failed to send reset instructions");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl"
          >
            <div className="mb-6 sm:mb-8 text-center">
              <img src={Logo} alt="CaseMap Logo" className="h-12 mx-auto mb-2" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isSubmitted ? "Check Your Email" : "Reset Your Password"}
              </h2>
            </div>

            {isSubmitted ? (
              <div className="text-center">
                <p className="mb-6 text-gray-600">
                  We've sent password reset instructions to:
                </p>
                <p className="font-medium text-lg mb-6">{email}</p>
                <p className="mb-8 text-gray-600">
                  Please check your email and follow the instructions to reset your password.
                </p>
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-tertiary hover:bg-tertiary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary text-center"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-6 text-gray-600 text-center">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-tertiary focus:border-tertiary"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-tertiary hover:bg-tertiary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-tertiary hover:text-tertiary/90">
                    Back to Login
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Column - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={LoginBG}
            alt="Login Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPassword;
