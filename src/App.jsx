import { Route, Routes, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { useSelector } from "react-redux";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const userInfo = useSelector((state) => state.auth.userInfo);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Routes>
        <Route path="/" element={userInfo ? <Navigate to="/chats" /> : <AuthPage />} />
        <Route path="/chats" element={userInfo ? <ChatPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={userInfo ? <ProfilePage /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
