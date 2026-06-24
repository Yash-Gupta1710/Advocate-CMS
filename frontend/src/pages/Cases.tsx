import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { caseService, Case } from '../services/caseService';
import api from '../services/api';
import { FiBriefcase, FiPlus, FiSearch, FiSliders, FiFileText, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

export default function Cases() {
  const { user } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  // State
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [priority, setPriority] = useState('MEDIUM');
  const [courtName, setCourtName] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [opposingParty, setOpposingParty] = useState('');
  const [opposingAdvocate, setOpposingAdvocate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const caseList = await caseService.getCases();
      setCases(caseList);

      if (isLawyer) {
        const { data } = await api.get('/users/clients');
        setClients(data);
      }
    } catch (err) {
      toast.error('Failed to load cases data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }

    try {
      await caseService.createCase({
        caseNumber,
        title,
        description,
        clientId: parseInt(clientId),
        status,
        priority,
        courtName,
        judgeName,
        filingDate,
        opposingParty,
        opposingAdvocate,
      });

      toast.success('Case registered successfully');
      setIsCreateModalOpen(false);
      // Reset form
      setCaseNumber('');
      setTitle('');
      setDescription('');
      setClientId('');
      setCourtName('');
      setJudgeName('');
      setOpposingParty('');
      setOpposingAdvocate('');

      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create case');
    }
  };

  if (loading && cases.length === 0) return <LoadingSpinner fullPage />;

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.clientName && c.clientName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Legal Cases</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLawyer 
              ? 'Track lawsuits, timeline changes, and client representation details.' 
              : 'View status, hearing logs, and progress updates of your active cases.'}
          </p>
        </div>
        {isLawyer && (
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary" size="sm">
            <FiPlus className="mr-1" /> New Case File
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="py-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Title, Case No, or Client..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <FiSliders className="w-4 h-4" /> Filters:
            </div>
            <select
              className="rounded-xl border-gray-200 text-xs bg-white py-2 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="DISPOSED">Disposed</option>
              <option value="APPEALED">Appealed</option>
            </select>
            <select
              className="rounded-xl border-gray-200 text-xs bg-white py-2 px-3"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Case Grid/List */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FiBriefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-navy-950 mb-1">No Cases Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or filter options, or register a new case profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Case number / priority status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {c.caseNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.priority === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : c.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-700'
                        : c.priority === 'MEDIUM'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.priority}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                {/* Case title */}
                <div>
                  <h3 className="text-base font-bold text-navy-950 group-hover:text-gold-600 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Court: {c.courtName}</p>
                </div>

                {/* Description */}
                {c.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}

                {/* Meta details */}
                <div className="pt-4 border-t border-gray-50 space-y-2 text-[11px] text-gray-500 font-medium">
                  {isLawyer ? (
                    <div className="flex justify-between">
                      <span>Client:</span>
                      <span className="text-navy-950 font-semibold">{c.clientName}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Representing:</span>
                      <span className="text-navy-950 font-semibold">{c.lawyerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5 text-gray-400" /> Filed:</span>
                    <span className="text-navy-950">{c.filingDate}</span>
                  </div>
                </div>
              </div>

              {/* View details footer link */}
              <Link
                to={`/cases/${c.id}`}
                className="bg-gray-50/50 border-t border-gray-100 hover:bg-gold-50/40 p-4 flex items-center justify-between text-xs font-bold text-navy-950 hover:text-gold-600 transition-colors"
              >
                <span>View Details & Timeline</span>
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CASE MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register Legal Case File">
        <form onSubmit={handleCreateCase} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Number *</label>
              <input
                type="text"
                placeholder="e.g. SC/2026/045"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Date *</label>
              <input
                type="date"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                required
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Title / Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe vs. State Administration"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Description</label>
            <textarea
              rows={3}
              placeholder="Brief details or scope of representation..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Client *</label>
              <select
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">-- Choose Client --</option>
                {clients.map(cl => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name} ({cl.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Name *</label>
              <input
                type="text"
                placeholder="e.g. High Court of Karnataka"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judge Name</label>
              <input
                type="text"
                placeholder="Hon'ble Justice Smith"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                <select
                  className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="DISPOSED">Disposed</option>
                  <option value="APPEALED">Appealed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority</label>
                <select
                  className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opposing Party Name</label>
              <input
                type="text"
                placeholder="Opponent Defendant Name"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={opposingParty}
                onChange={(e) => setOpposingParty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opposing Advocate</label>
              <input
                type="text"
                placeholder="Senior Advocate Brown"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={opposingAdvocate}
                onChange={(e) => setOpposingAdvocate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
