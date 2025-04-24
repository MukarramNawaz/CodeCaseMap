import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Logo from "../assets/CaseMap logo.png";
import LogoTransparent from "../assets/CaseMap logo.png";
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
    <div className="min-h-screen bg-black flex">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={Logo} alt="" />
            <h1 className="text-5xl font-bold text-white mb-6">
              {t("login.welcomeBack")}
            </h1>
            <p className="text-white text-lg">{t("login.loginMessage")}</p>
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
            {" "}
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
              alt=""
              className="h-10 w-30 mx-auto lg:hidden"
            />
            <h2 className="text-3xl font-bold mb-4 text-center">
              {t("login.loginAccount")}
            </h2>
            <p className=" mb-4 text-center">{t("login.businessInsight")}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 my-8 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-200 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("login.rememberMe")}
                  </label>
                </div>

                <a className="text-sm font-medium text-primary hover:underline">
                  {t("login.forgotPassword")}
                </a>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
              <Link to="/signup" className="text-primary hover:text-primary/90">
                {t("login.createAccount")}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
