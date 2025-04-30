import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Logo from "../assets/CaseMap logo.png";
import LogoTransparent from "../assets/CaseMap logo.png";
import LoginBG from "../assets/LoginBG.jpg";
import { useTranslation } from "react-i18next";
import { loginUser, signInWithGoogle } from "../services/api";

function Login() {
  const { i18n, t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        navigate("/chat");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error logging in, Check Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await signInWithGoogle();
      if (response.success) {
        navigate("/chat");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error signing in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden"> 
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto"> 
        <div className="max-w-md w-full">
          {/* Language selector positioned at top left */}
          {/* <div className="fixed top-6 left-6 z-10">
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-tertiary transition-all shadow-sm"
            >
              <option value="en">{t("language.en")}</option>
              <option value="fr">{t("language.fr")}</option>
            </select>
          </div> */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={Logo} alt="CaseMap logo" className="h-40 mx-auto mb-6" />

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4 text-center">
                {t("login.loginAccount")}
              </h2>
              <p className="mb-4 text-center">{t("login.businessInsight")}</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 my-8 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  {t("login.googleLogin")}
                  {isLoading && (
                    <span className="w-3 h-3 ml-2 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {t("login.emailPrompt")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("login.emailAddress")}
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("login.password")}
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-tertiary focus:border-tertiary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
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

                  <a className="text-sm font-medium text-tertiary hover:underline">
                    {t("login.forgotPassword")}
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-tertiary hover:bg-tertiary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary"
                >
                  {t("login.login")}{" "}
                  {isLoading ? (
                    <span className="w-3 h-3 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    ""
                  )}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                {t("login.noAccount")}{" "}
                <Link
                  to="/signup"
                  className="text-tertiary hover:text-tertiary/90"
                >
                  {t("login.createAccount")}
                </Link>
              </p>
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
              By signing in, you agree to our{" "}
              <a href="" className="text-tertiary hover:text-tertiary/90">
                privacy policy
              </a>{" "}
              and{" "}
              <a href="" className="text-tertiary hover:text-tertiary/90">
                terms of service
              </a>
            </p>
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

export default Login;
