import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled via toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold-500/20">
            <FiShield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Advocate CMS</h1>
          <p className="text-navy-300 text-lg leading-relaxed">
            Professional client management for modern legal practice. Manage appointments, cases, and documents — all in one place.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-500">500+</p>
              <p className="text-xs text-navy-400 mt-1">Cases Managed</p>
            </div>
            <div className="w-px h-10 bg-navy-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-500">100%</p>
              <p className="text-xs text-navy-400 mt-1">Secure</p>
            </div>
            <div className="w-px h-10 bg-navy-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-500">24/7</p>
              <p className="text-xs text-navy-400 mt-1">Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
              <FiShield className="w-6 h-6 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-navy-950 text-center">Welcome Back</h2>
          <p className="text-gray-500 text-center mt-2 text-sm">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg shadow-navy-950/25 hover:shadow-xl hover:shadow-navy-950/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-600 font-semibold hover:text-gold-700">
              Create Account
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-xl bg-navy-50 border border-navy-100">
            <p className="text-xs font-semibold text-navy-700 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-navy-600">
              <p><span className="font-medium">Lawyer:</span> lawyer@advocate.com / Password123</p>
              <p><span className="font-medium">Client:</span> client@advocate.com / Password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
