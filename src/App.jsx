import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import "./i18n";
function App() {
  return (
    <div>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="/" element= {<ProtectedRoute> <Chat /> </ProtectedRoute> }/>
          <Route
            path="*"
            element={<Navigate to="/chat" replace />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
