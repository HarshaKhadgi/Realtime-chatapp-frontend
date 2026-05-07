import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/users/auth', { email, password }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      dispatch(setCredentials(data));
      navigate('/chats');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
      {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-sm text-center">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
        <input 
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:bg-gray-700 dark:text-white" 
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
        <input 
          type="password"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:bg-gray-700 dark:text-white" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg shadow-indigo-500/30"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
      </button>
      <button 
        type="button" 
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mx-auto mt-2"
        onClick={() => {
          setEmail('guest@example.com');
          setPassword('123456');
        }}
      >
        Get Guest Credentials
      </button>
    </form>
  );
};

export default Login;
