import { useEffect, useState } from 'react';
import { FiCalendar, FiBriefcase, FiFileText, FiClock } from 'react-icons/fi';
import { appointmentService, Appointment } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const appts = await appointmentService.getMyAppointments();
      setAppointments(appts);
    } catch (err) {
      console.error('Failed to load client dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const upcoming = appointments.filter(a => a.status === 'APPROVED' || a.status === 'RESCHEDULED');
  const pending = appointments.filter(a => a.status === 'REQUESTED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Welcome, {user?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's a summary of your legal activity.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', value: upcoming.length, icon: FiCalendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pending.length, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'My Cases', value: 0, icon: FiBriefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Documents', value: 0, icon: FiFileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-950">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <h2 className="text-lg font-bold text-navy-950 mb-5">Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(appt => (
              <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-navy-950">
                    {format(new Date(appt.date), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{appt.startTime} - {appt.endTime} · {appt.description}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-navy-950 mb-5">Pending Requests</h2>
          <div className="space-y-3">
            {pending.map(appt => (
              <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div>
                  <p className="text-sm font-semibold text-navy-950">
                    {format(new Date(appt.date), 'MMM dd, yyyy')} · {appt.startTime} - {appt.endTime}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{appt.description}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
