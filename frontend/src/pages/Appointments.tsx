import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService, availabilityService, Appointment, AvailabilitySlot } from '../services/appointmentService';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { FiCalendar, FiPlus, FiTrash2, FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Appointments() {
  const { user } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Modals state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Form states
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  // New slot form state
  const [slotDate, setSlotDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [slotStatus, setSlotStatus] = useState('AVAILABLE');
  const [slotDesc, setSlotDesc] = useState('');

  // Recurring slots form state
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [recStartTime, setRecStartTime] = useState('09:00');
  const [recEndTime, setRecEndTime] = useState('17:00');
  const [recWeeks, setRecWeeks] = useState(4);
  const [recStatus, setRecStatus] = useState('AVAILABLE');
  const [recDesc, setRecDesc] = useState('');

  // Client request appointment form state
  const [reqSlotId, setReqSlotId] = useState<number | null>(null);
  const [reqDescription, setReqDescription] = useState('');
  const [reqDate, setReqDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reqStartTime, setReqStartTime] = useState('09:00');
  const [reqEndTime, setReqEndTime] = useState('09:30');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appts = await appointmentService.getMyAppointments();
      setAppointments(appts);

      const slots = await availabilityService.getAvailability(
        format(startOfWeek(new Date()), 'yyyy-MM-dd'),
        format(addDays(new Date(), 30), 'yyyy-MM-dd')
      );
      setAvailability(slots);
    } catch (err) {
      toast.error('Failed to load appointments/availability data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Availability action handlers
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slotStartTime >= slotEndTime) {
      toast.error('Start time must be before end time');
      return;
    }
    try {
      await availabilityService.createSlot({
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
        status: slotStatus,
        description: slotDesc,
      });
      toast.success('Availability slot created successfully');
      setIsSlotModalOpen(false);
      // Reset
      setSlotDesc('');
      fetchData();
    } catch (err) {
      toast.error('Failed to create slot');
    }
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recurringDays.length === 0) {
      toast.error('Select at least one day of the week');
      return;
    }
    if (recStartTime >= recEndTime) {
      toast.error('Start time must be before end time');
      return;
    }
    try {
      await availabilityService.createRecurring({
        daysOfWeek: recurringDays,
        startTime: recStartTime,
        endTime: recEndTime,
        weeksAhead: recWeeks,
        status: recStatus,
        description: recDesc,
      });
      toast.success('Recurring slots created successfully');
      setIsRecurringModalOpen(false);
      setRecurringDays([]);
      fetchData();
    } catch (err) {
      toast.error('Failed to create recurring slots');
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      try {
        await availabilityService.deleteSlot(id);
        toast.success('Slot deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete slot');
      }
    }
  };

  // Appointment action handlers
  const handleApprove = async (id: number) => {
    try {
      await appointmentService.approveAppointment(id);
      toast.success('Appointment approved');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId) return;
    try {
      await appointmentService.rejectAppointment(selectedApptId, rejectionReason);
      toast.success('Appointment rejected');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject appointment');
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId) return;
    try {
      await appointmentService.cancelAppointment(selectedApptId, cancellationReason);
      toast.success('Appointment cancelled');
      setIsCancelModalOpen(false);
      setCancellationReason('');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await appointmentService.completeAppointment(id);
      toast.success('Appointment marked as completed');
      fetchData();
    } catch (err) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payloadDate = reqDate;
      let payloadStart = reqStartTime;
      let payloadEnd = reqEndTime;

      if (reqSlotId) {
        const slot = availability.find(s => s.id === reqSlotId);
        if (slot) {
          payloadDate = slot.date;
          payloadStart = slot.startTime;
          payloadEnd = slot.endTime;
        }
      }

      await appointmentService.requestAppointment({
        date: payloadDate,
        startTime: payloadStart,
        endTime: payloadEnd,
        description: reqDescription,
      });

      toast.success('Appointment requested successfully. Awaiting lawyer approval.');
      setIsRequestModalOpen(false);
      setReqDescription('');
      setReqSlotId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request appointment');
    }
  };

  const toggleDay = (day: string) => {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (loading && appointments.length === 0) return <LoadingSpinner fullPage />;

  const dailySlots = availability.filter(s => s.date === selectedDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Appointments & Scheduling</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLawyer 
              ? 'Manage client consultation requests and define your working hours.' 
              : 'Book consultation slots and check your upcoming consultations.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLawyer ? (
            <>
              <Button onClick={() => setIsRecurringModalOpen(true)} variant="secondary" size="sm">
                <FiPlus className="mr-1" /> Recurring Slots
              </Button>
              <Button onClick={() => setIsSlotModalOpen(true)} variant="primary" size="sm">
                <FiPlus className="mr-1" /> Single Slot
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsRequestModalOpen(true)} variant="primary" size="sm">
              <FiCalendar className="mr-1" /> Request Appointment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability / Calendar panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-navy-950 mb-4">Availability Calendar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-gold-500 focus:ring-gold-500 bg-white text-navy-950"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Slots on {format(parseISO(selectedDate), 'MMM dd, yyyy')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 font-semibold">
                    {dailySlots.length} Total
                  </span>
                </div>

                {dailySlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiClock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No availability slots set for this day</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {dailySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy-950">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            slot.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-600'
                              : slot.status === 'BUSY'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {slot.status}
                          </span>
                        </div>
                        {isLawyer && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Slot"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Appointments List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-navy-950">Consultations & Requests</h2>
              <span className="text-xs px-2.5 py-1 bg-navy-950 text-white rounded-full font-semibold">
                {appointments.length} Appointments
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <FiCalendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-base font-bold text-navy-950 mb-1">No Consultations Scheduled</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  {isLawyer 
                    ? 'Consultations requested by clients will appear here. Set availability slots so clients can request bookings.' 
                    : 'You have not booked any consultations yet. Click the button above to request an appointment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {isLawyer ? appt.clientName?.charAt(0) : appt.lawyerName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy-950">
                            {isLawyer ? appt.clientName : `Lawyer: ${appt.lawyerName}`}
                          </h4>
                          <p className="text-xs text-gray-400">{isLawyer ? appt.clientEmail : 'Consultation Service'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-gold-500" />
                          {format(parseISO(appt.date), 'MMMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-gold-500" />
                          {appt.startTime} - {appt.endTime}
                        </span>
                      </div>

                      {appt.description && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2 max-w-xl">
                          <span className="font-semibold text-navy-950">Note:</span> {appt.description}
                        </p>
                      )}

                      {appt.status === 'REJECTED' && appt.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100/50 mt-2 max-w-xl">
                          <span className="font-semibold">Rejection Reason:</span> {appt.rejectionReason}
                        </p>
                      )}

                      {appt.status === 'CANCELLED' && appt.cancellationReason && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2 max-w-xl">
                          <span className="font-semibold">Cancellation Reason:</span> {appt.cancellationReason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-end gap-3 justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                      <StatusBadge status={appt.status} />

                      {/* Lawyer Actions */}
                      {isLawyer && appt.status === 'REQUESTED' && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleApprove(appt.id)}
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Approve Request"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApptId(appt.id);
                              setIsRejectModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Reject Request"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isLawyer && (appt.status === 'APPROVED' || appt.status === 'RESCHEDULED') && (
                        <Button
                          onClick={() => handleComplete(appt.id)}
                          variant="secondary"
                          size="xs"
                          className="mt-2"
                        >
                          Mark Completed
                        </Button>
                      )}

                      {/* Client Actions */}
                      {!isLawyer && (appt.status === 'REQUESTED' || appt.status === 'APPROVED' || appt.status === 'RESCHEDULED') && (
                        <Button
                          onClick={() => {
                            setSelectedApptId(appt.id);
                            setIsCancelModalOpen(true);
                          }}
                          variant="danger"
                          size="xs"
                          className="mt-2"
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SINGLE SLOT MODAL (Lawyer Only) */}
      <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} title="Create Availability Slot">
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-200 text-navy-950"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
              <input
                type="time"
                className="w-full rounded-xl border-gray-200 text-navy-950"
                required
                value={slotStartTime}
                onChange={(e) => setSlotStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
              <input
                type="time"
                className="w-full rounded-xl border-gray-200 text-navy-950"
                required
                value={slotEndTime}
                onChange={(e) => setSlotEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              className="w-full rounded-xl border-gray-200 text-navy-950 bg-white"
              value={slotStatus}
              onChange={(e) => setSlotStatus(e.target.value)}
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="IN_COURT">In Court</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Case preparation or meeting room 2"
              className="w-full rounded-xl border-gray-200 text-navy-950"
              value={slotDesc}
              onChange={(e) => setSlotDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECURRING SLOTS MODAL (Lawyer Only) */}
      <Modal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} title="Generate Recurring Slots">
        <form onSubmit={handleCreateRecurring} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Days of Week</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                const isSelected = recurringDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      isSelected
                        ? 'bg-navy-950 border-navy-950 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
              <input
                type="time"
                className="w-full rounded-xl border-gray-200 text-navy-950"
                required
                value={recStartTime}
                onChange={(e) => setRecStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
              <input
                type="time"
                className="w-full rounded-xl border-gray-200 text-navy-950"
                required
                value={recEndTime}
                onChange={(e) => setRecEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Weeks Ahead</label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full rounded-xl border-gray-200 text-navy-950"
                required
                value={recWeeks}
                onChange={(e) => setRecWeeks(parseInt(e.target.value) || 4)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                className="w-full rounded-xl border-gray-200 text-navy-950 bg-white"
                value={recStatus}
                onChange={(e) => setRecStatus(e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="IN_COURT">In Court</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Regular office hours"
              className="w-full rounded-xl border-gray-200 text-navy-950"
              value={recDesc}
              onChange={(e) => setRecDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsRecurringModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate
            </Button>
          </div>
        </form>
      </Modal>

      {/* REQUEST APPOINTMENT MODAL (Client Only) */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Consultation Slot">
        <form onSubmit={handleRequestAppointment} className="space-y-4">
          <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-navy-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-navy-800 space-y-1">
              <p className="font-semibold">How to Book:</p>
              <p>1. Select the Date you'd like to book.</p>
              <p>2. Choose from the lawyer's pre-set slots (if any are available) or request a custom window below.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-200 text-navy-950"
              required
              value={reqDate}
              onChange={(e) => {
                setReqDate(e.target.value);
                setReqSlotId(null);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Available Slots on Selected Date</label>
            {availability.filter(s => s.date === reqDate && s.status === 'AVAILABLE').length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-505 text-gray-500">
                No slots configured by lawyer. Please type custom times below.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                {availability
                  .filter(s => s.date === reqDate && s.status === 'AVAILABLE')
                  .map(slot => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setReqSlotId(slot.id)}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        reqSlotId === slot.id
                          ? 'border-gold-500 bg-gold-50/40 font-semibold text-gold-950'
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-navy-950'
                      } text-xs`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {!reqSlotId && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Custom Start Time</label>
                <input
                  type="time"
                  className="w-full rounded-xl border-gray-200 text-navy-950"
                  required
                  value={reqStartTime}
                  onChange={(e) => setReqStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Custom End Time</label>
                <input
                  type="time"
                  className="w-full rounded-xl border-gray-200 text-navy-950"
                  required
                  value={reqEndTime}
                  onChange={(e) => setReqEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">What is this consultation about?</label>
            <textarea
              required
              rows={3}
              placeholder="Provide a brief summary of your legal inquiry..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={reqDescription}
              onChange={(e) => setReqDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* REJECT APPOINTMENT MODAL (Lawyer Only) */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Appointment Request">
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reason for Rejection</label>
            <textarea
              required
              rows={3}
              placeholder="Provide a brief explanation for the client..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* CANCEL APPOINTMENT MODAL (Client Only) */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Appointment">
        <form onSubmit={handleCancel} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reason for Cancellation</label>
            <textarea
              required
              rows={3}
              placeholder="Why do you need to cancel this appointment?"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Cancel Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
