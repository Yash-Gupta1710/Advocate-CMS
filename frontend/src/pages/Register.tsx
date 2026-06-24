import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const securityQuestions = [
  "What is your mother's maiden name?",
  "What is the name of your first pet?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite movie?",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'client' as 'client' | 'lawyer',
    securityQuestion: securityQuestions[0],
    securityAnswer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!form.securityAnswer.trim()) {
      toast.error('Security answer is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(form.fullName, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch {
      // handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <FiShield className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-950 text-center">Create Account</h2>
        <p className="text-gray-500 text-center mt-1 text-sm">Register to access the Advocate CMS portal</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Role Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            {(['client', 'lawyer'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => updateField('role', role)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  form.role === role
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role === 'client' ? '👤 Client' : '⚖️ Lawyer'}
              </button>
            ))}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.fullName}
                onChange={e => updateField('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => updateField('phoneNumber', e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Security Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Question</label>
            <select
              value={form.securityQuestion}
              onChange={e => updateField('securityQuestion', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
            >
              {securityQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Security Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Answer</label>
            <input
              type="text"
              value={form.securityAnswer}
              onChange={e => updateField('securityAnswer', e.target.value)}
              placeholder="Your answer"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg shadow-navy-950/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
