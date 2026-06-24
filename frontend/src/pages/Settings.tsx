import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { FiUser, FiLock, FiBell, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally would call an API here
    toast.success('Profile updated successfully');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    // Normally would call an API here
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card bodyClassName="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-navy-50 text-navy-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-navy-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card title="Profile Settings" subtitle="Update your personal information">
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card title="Change Password" subtitle="Ensure your account is using a long, random password to stay secure.">
                <form onSubmit={handlePasswordUpdate} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </Card>

              <Card title="Two-Factor Authentication" subtitle="Add additional security to your account using two-factor authentication.">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Status: <span className="text-red-500">Disabled</span></p>
                    <p className="text-xs text-gray-500 mt-1">Protect your account from unauthorized access.</p>
                  </div>
                  <Button variant="outline" leftIcon={<FiShield />}>Enable 2FA</Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences" subtitle="Choose what you want to be notified about.">
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive emails about appointment updates and new documents.', defaultChecked: true },
                  { title: 'Push Notifications', desc: 'Receive push notifications on your device.', defaultChecked: false },
                  { title: 'Case Updates', desc: 'Get notified when a case status changes or a hearing is added.', defaultChecked: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 bg-navy-600">
                      <span className={`translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
