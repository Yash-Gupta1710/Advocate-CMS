import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield, FiLock, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'answer' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.get('/auth/security-question', { params: { email } });
      setSecurityQuestion(data.securityQuestion);
      setStep('answer');
      toast.success('Security question retrieved');
    } catch {
      toast.error('No account found with this email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email, securityAnswer, newPassword });
      setStep('done');
      toast.success('Password reset successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <FiShield className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-950 text-center">Reset Password</h2>
        <p className="text-gray-500 text-center mt-1 text-sm">
          {step === 'email' && 'Enter your email to get your security question'}
          {step === 'answer' && 'Answer your security question to reset password'}
          {step === 'done' && 'Your password has been reset'}
        </p>

        {step === 'email' && (
          <form onSubmit={handleGetQuestion} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {isSubmitting ? 'Loading...' : 'Get Security Question'}
            </button>
          </form>
        )}

        {step === 'answer' && (
          <form onSubmit={handleReset} className="mt-8 space-y-5">
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
              <p className="text-sm font-medium text-navy-700">{securityQuestion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
              <input
                type="text"
                value={securityAnswer}
                onChange={e => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="mt-8 text-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Your password has been updated. You can now sign in with your new password.</p>
            <Link to="/login" className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Go to Login
            </Link>
          </div>
        )}

        {step !== 'done' && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
