import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import Logo from './Logo';
import toast from 'react-hot-toast';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
        if (success) {
          toast.success('Welcome back!');
        } else {
          toast.error('Invalid credentials');
        }
      } else {
        success = await signup(email, password, name);
        if (success) {
          toast.success('Account created successfully!');
        } else {
          toast.error('Signup failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-[#ededed] mb-2">CyberShield</h1>
          <p className="text-[#525252] text-sm">Defense Log Analyzer</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-4 mb-6 border-b border-[#262626]">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                isLogin ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                !isLogin ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded text-sm text-[#ededed] placeholder-[#525252] focus:outline-none focus:border-[#404040] transition-colors"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded text-sm text-[#ededed] placeholder-[#525252] focus:outline-none focus:border-[#404040] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded text-sm text-[#ededed] placeholder-[#525252] focus:outline-none focus:border-[#404040] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ededed] text-[#0a0a0a] rounded text-sm font-medium hover:bg-[#d4d4d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#262626]">
            <p className="text-[11px] text-[#525252] text-center">
              Demo credentials: any email + password (min 6 chars)
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#404040]">
            Protected by Clerk · 50K MRU free tier
          </p>
        </div>
      </div>
    </div>
  );
}
