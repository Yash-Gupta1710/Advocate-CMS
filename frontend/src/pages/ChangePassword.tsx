import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy-950 mb-2">Password Changed</h2>
        <p className="text-gray-500">Your password has been updated successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-navy-950 mb-1">Change Password</h1>
      <p className="text-gray-500 text-sm mb-8">Update your account password</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showOld ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-800 to-navy-950 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
