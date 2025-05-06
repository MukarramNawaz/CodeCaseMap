import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import toast from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import "./i18n";
// Email confirmation handler component
function EmailConfirmationHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Confirming your email...");

  useEffect(() => {
    // Process the email confirmation
    const handleEmailConfirmation = async () => {
      try {
        // The hash contains the access token and refresh token
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "signup" && accessToken) {
          // Set the session manually to log the user in
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          // Get user data to ensure we have a valid session
          const { data: userData, error: userError } =
            await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          setStatus("Email confirmed successfully! Redirecting to app...");
          toast.success("Email confirmed successfully!");

          // Redirect to chat immediately - no need to wait since we've confirmed the session is valid
          navigate("/chat");
        } else {
          setStatus("Invalid confirmation link");
          toast.error("Invalid confirmation link");

          // Redirect to login after a short delay
          // setTimeout(() => {
          //   navigate('/login');
          // }, 2000);
        }
      } catch (error) {
        console.error("Error confirming email:", error);
        setStatus("Error confirming email");
        toast.error("Error confirming email. Please try again.");

        // // Redirect to login after a short delay
        // setTimeout(() => {
        //   navigate('/login');
        // }, 2000);
      }
    };

    if (location.hash) {
      handleEmailConfirmation();
    } else {
      // If there's no hash in the URL, check if we already have a session
      const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (data?.session) {
          // User is already logged in, redirect to chat
          navigate("/chat");
        } else {
          // No session, redirect to login
          navigate("/login");
        }
      };

      checkSession();
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-tertiary mb-4">{status}</h2>
        <p className="text-gray-600">
          {status === "Confirming your email..."
            ? "Please wait while we confirm your email address..."
            : ""}
        </p>
        <div className="mt-4">
          {status === "Confirming your email..." && (
            <div className="w-8 h-8 border-4 border-tertiary border-t-transparent rounded-full animate-spin mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/confirm" element={<EmailConfirmationHandler />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {" "}
                <Chat />{" "}
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
