import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiBriefcase, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { appointmentService, Appointment } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { format } from 'date-fns';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function LawyerDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const appts = await appointmentService.getMyAppointments();
      setAppointments(appts);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const pending = appointments.filter(a => a.status === 'REQUESTED');
  const approved = appointments.filter(a => a.status === 'APPROVED' || a.status === 'RESCHEDULED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const uniqueClients = new Set(appointments.map(a => a.clientId)).size;

  const stats: StatCard[] = [
    { label: 'Total Clients', value: uniqueClients, icon: FiUsers, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Upcoming Appointments', value: approved.length, icon: FiCalendar, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Pending Requests', value: pending.length, icon: FiClock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Completed', value: completed.length, icon: FiCheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Active Cases', value: 0, icon: FiBriefcase, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { label: 'Documents', value: 0, icon: FiFileText, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's an overview of your practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-navy-950 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Appointment Requests */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy-950">Pending Appointment Requests</h2>
          <span className="text-xs font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No pending appointment requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map(appt => (
              <div
                key={appt.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-sm font-bold">
                    {appt.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-950">{appt.clientName}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(appt.date), 'MMM dd, yyyy')} · {appt.startTime} - {appt.endTime}
                    </p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy-950">Upcoming Appointments</h2>
        </div>
        {approved.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.slice(0, 5).map(appt => (
              <div
                key={appt.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white text-sm font-bold">
                    {appt.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-950">{appt.clientName}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(appt.date), 'MMM dd, yyyy')} · {appt.startTime} - {appt.endTime}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{appt.description}</p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
