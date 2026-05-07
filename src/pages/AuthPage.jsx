import React, { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { MessageCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-900 dark:opacity-20 z-0"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-900 dark:opacity-20 z-0"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900 dark:opacity-20 z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8 m-4 rounded-2xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-sans text-gray-800 dark:text-gray-100 tracking-tight">
            NexusChat
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connect instantly, securely.</p>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-6 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            <button
              className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isLogin ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${!isLogin ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="transition-all duration-500 ease-in-out">
            {isLogin ? <Login /> : <Signup />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
