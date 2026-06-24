import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService, Case, CaseTimeline, Hearing } from '../services/caseService';
import { documentService, Document } from '../services/documentService';
import {
  FiArrowLeft, FiClock, FiCalendar, FiPlus, FiTrash2,
  FiEdit, FiFileText, FiUpload, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO } from 'date-fns';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  // Data State
  const [lawCase, setLawCase] = useState<Case | null>(null);
  const [timeline, setTimeline] = useState<CaseTimeline[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'hearings' | 'documents'>('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateHearingModalOpen, setIsUpdateHearingModalOpen] = useState(false);

  // Edit Case Form State
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [priority, setPriority] = useState('MEDIUM');
  const [courtName, setCourtName] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [opposingParty, setOpposingParty] = useState('');
  const [opposingAdvocate, setOpposingAdvocate] = useState('');

  // Add Timeline Event Form State
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0] + 'T12:00');

  // Schedule Hearing Form State
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().split('T')[0] + 'T10:00');
  const [hearingPurpose, setHearingPurpose] = useState('');
  const [hearingNotes, setHearingNotes] = useState('');

  // Update Hearing Status Form State
  const [selectedHearingId, setSelectedHearingId] = useState<number | null>(null);
  const [hearingStatusUpdate, setHearingStatusUpdate] = useState('CONCLUDED');
  const [hearingNotesUpdate, setHearingNotesUpdate] = useState('');

  // Document Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('COURT_ORDER');

  useEffect(() => {
    if (id) {
      loadAllCaseData();
    }
  }, [id]);

  const loadAllCaseData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const caseId = parseInt(id);
      const c = await caseService.getCaseById(caseId);
      setLawCase(c);
      
      // Pre-populate edit form fields
      setCaseNumber(c.caseNumber);
      setTitle(c.title);
      setDescription(c.description || '');
      setStatus(c.status);
      setPriority(c.priority);
      setCourtName(c.courtName);
      setJudgeName(c.judgeName || '');
      setFilingDate(c.filingDate);
      setOpposingParty(c.opposingParty || '');
      setOpposingAdvocate(c.opposingAdvocate || '');

      const tList = await caseService.getTimeline(caseId);
      setTimeline(tList);

      const hList = await caseService.getHearings(caseId);
      setHearings(hList);

      const docList = await documentService.getCaseDocuments(caseId);
      setDocuments(docList);
    } catch (err) {
      toast.error('Failed to load case profile details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !lawCase) return;
    try {
      await caseService.updateCase(lawCase.id, {
        caseNumber,
        title,
        description,
        clientId: lawCase.clientId,
        status,
        priority,
        courtName,
        judgeName,
        filingDate,
        opposingParty,
        opposingAdvocate,
      });
      toast.success('Case updated successfully');
      setIsEditModalOpen(false);
      loadAllCaseData();
    } catch (err) {
      toast.error('Failed to update case');
    }
  };

  const handleDeleteCase = async () => {
    if (!lawCase) return;
    if (confirm('CAUTION: Are you sure you want to delete this case file permanently? All timeline updates and hearings will be lost.')) {
      try {
        await caseService.deleteCase(lawCase.id);
        toast.success('Case file deleted');
        navigate('/cases');
      } catch (err) {
        toast.error('Failed to delete case file');
      }
    }
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawCase) return;
    try {
      await caseService.addTimelineEvent(lawCase.id, {
        title: timelineTitle,
        description: timelineDesc,
        eventDate: timelineDate,
      });
      toast.success('Timeline milestone logged');
      setIsTimelineModalOpen(false);
      setTimelineTitle('');
      setTimelineDesc('');
      loadAllCaseData();
    } catch (err) {
      toast.error('Failed to log timeline event');
    }
  };

  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawCase) return;
    try {
      await caseService.scheduleHearing(lawCase.id, {
        hearingDate,
        purpose: hearingPurpose,
        notes: hearingNotes,
      });
      toast.success('Hearing scheduled');
      setIsHearingModalOpen(false);
      setHearingPurpose('');
      setHearingNotes('');
      loadAllCaseData();
    } catch (err) {
      toast.error('Failed to schedule hearing');
    }
  };

  const handleUpdateHearingStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHearingId) return;
    try {
      await caseService.updateHearingStatus(selectedHearingId, hearingStatusUpdate, hearingNotesUpdate);
      toast.success('Hearing record updated');
      setIsUpdateHearingModalOpen(false);
      setSelectedHearingId(null);
      setHearingNotesUpdate('');
      loadAllCaseData();
    } catch (err) {
      toast.error('Failed to update hearing');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawCase || !uploadFile) return;
    try {
      await documentService.uploadDocument(uploadFile, uploadCategory, lawCase.id);
      toast.success('Document uploaded and linked to case');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      loadAllCaseData();
    } catch (err) {
      toast.error('Failed to upload file');
    }
  };

  const handleDocDownload = async (docId: number, originalFilename: string) => {
    try {
      await documentService.downloadDocument(docId, originalFilename);
      toast.success('Downloading document');
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  const handleDocDelete = async (docId: number) => {
    if (confirm('Delete this document?')) {
      try {
        await documentService.deleteDocument(docId);
        toast.success('Document deleted');
        loadAllCaseData();
      } catch (err) {
        toast.error('Failed to delete document');
      }
    }
  };

  if (loading && !lawCase) return <LoadingSpinner fullPage />;
  if (!lawCase) return <div className="text-center py-20 text-red-500">Case profile not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link to="/cases" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gold-600 transition-colors uppercase">
          <FiArrowLeft className="w-4 h-4" /> Back to Case Files
        </Link>
      </div>

      {/* Case Header Details Panel */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {lawCase.caseNumber}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                lawCase.priority === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : lawCase.priority === 'HIGH'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {lawCase.priority} Priority
              </span>
              <StatusBadge status={lawCase.status} />
            </div>

            <h1 className="text-2xl font-bold text-navy-950">{lawCase.title}</h1>
            <p className="text-xs text-gray-500 font-medium">
              Court: <span className="text-navy-950 font-semibold">{lawCase.courtName}</span>
              {lawCase.judgeName && ` · Judge: ${lawCase.judgeName}`}
            </p>
          </div>

          {isLawyer && (
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" size="sm">
                <FiEdit className="mr-1" /> Edit Profile
              </Button>
              <Button onClick={handleDeleteCase} variant="danger" size="sm">
                <FiTrash2 className="mr-1" /> Delete File
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['overview', 'timeline', 'hearings', 'documents'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'border-gold-500 text-gold-600 font-extrabold'
                  : 'border-transparent text-gray-400 hover:text-navy-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB PANELS */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h3 className="text-sm font-bold text-navy-950 border-b border-gray-100 pb-3 mb-4">Case Brief / Description</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {lawCase.description || 'No description or brief has been logged for this case.'}
                </p>
              </Card>

              <Card>
                <h3 className="text-sm font-bold text-navy-950 border-b border-gray-100 pb-3 mb-4">Opposing Party Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">Opposing Party</span>
                    <span className="text-navy-950 font-semibold">{lawCase.opposingParty || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Opposing Counsel</span>
                    <span className="text-navy-950 font-semibold">{lawCase.opposingAdvocate || 'Not Specified'}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <h3 className="text-sm font-bold text-navy-950 border-b border-gray-100 pb-3 mb-4">Key Personnel</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center font-bold">
                      {lawCase.clientName?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Client (Representation)</span>
                      <span className="text-navy-950 font-semibold">{lawCase.clientName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center font-bold">
                      {lawCase.lawyerName?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Represented By (Advocate)</span>
                      <span className="text-navy-950 font-semibold">{lawCase.lawyerName}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-50 flex justify-between">
                    <span className="text-gray-400">Date Filed:</span>
                    <span className="text-navy-950 font-semibold">{lawCase.filingDate}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'timeline' && (
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-sm font-bold text-navy-950">Visual Case Audit Timeline</h3>
              {isLawyer && (
                <Button onClick={() => setIsTimelineModalOpen(true)} variant="primary" size="xs">
                  <FiPlus className="mr-1" /> Log Milestone
                </Button>
              )}
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-10">
                <FiClock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-500">No events or milestones logged on the timeline yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-8 py-2">
                {timeline.map((event) => (
                  <div key={event.id} className="relative">
                    {/* timeline bullet */}
                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-gold-500 border-4 border-white shadow-sm"></span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-bold text-navy-950">{event.title}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {format(parseISO(event.eventDate), 'MMM dd, yyyy - hh:mm a')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 max-w-2xl bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: HEARINGS */}
        {activeTab === 'hearings' && (
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-sm font-bold text-navy-950">Court Hearing Records</h3>
              {isLawyer && (
                <Button onClick={() => setIsHearingModalOpen(true)} variant="primary" size="xs">
                  <FiPlus className="mr-1" /> Schedule Hearing
                </Button>
              )}
            </div>

            {hearings.length === 0 ? (
              <div className="text-center py-10">
                <FiCalendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-500">No hearings have been scheduled for this case.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hearings.map((h) => (
                  <div
                    key={h.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-navy-950 bg-navy-50 px-2 py-0.5 rounded">
                          Hearing ID: {h.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          h.status === 'SCHEDULED'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : h.status === 'CONCLUDED'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                        <FiCalendar className="text-gold-500" />
                        {format(parseISO(h.hearingDate), 'MMMM dd, yyyy - hh:mm a')}
                      </p>
                      <p className="text-xs text-gray-800">
                        <span className="font-semibold text-navy-950">Purpose:</span> {h.purpose}
                      </p>
                      {h.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50 mt-1 max-w-xl">
                          <span className="font-semibold">Notes:</span> {h.notes}
                        </p>
                      )}
                    </div>

                    {isLawyer && h.status === 'SCHEDULED' && (
                      <div className="flex items-end">
                        <Button
                          onClick={() => {
                            setSelectedHearingId(h.id);
                            setIsUpdateHearingModalOpen(true);
                          }}
                          variant="secondary"
                          size="xs"
                        >
                          Update Status
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 4: DOCUMENTS */}
        {activeTab === 'documents' && (
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-sm font-bold text-navy-950">Linked Documents</h3>
              <Button onClick={() => setIsUploadModalOpen(true)} variant="primary" size="xs">
                <FiUpload className="mr-1" /> Upload File
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-10">
                <FiFileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-500">No documents uploaded and linked to this case file.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-bold text-navy-950 truncate" title={doc.originalFilename}>
                        {doc.originalFilename}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold-50 text-gold-600 uppercase">
                          {doc.category}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {(doc.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Uploaded by: {doc.ownerName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDocDownload(doc.id, doc.originalFilename)}
                        className="p-1.5 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors"
                        title="Download"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      {(isLawyer || doc.ownerId === user?.id) && (
                        <button
                          onClick={() => handleDocDelete(doc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* EDIT CASE MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Case Profile">
        <form onSubmit={handleUpdateCase} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Number</label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Date</label>
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
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Title</label>
            <input
              type="text"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Brief / Details</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Name</label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judge Name</label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opposing Party</label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={opposingParty}
                onChange={(e) => setOpposingParty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opposing Advocate</label>
              <input
                type="text"
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
                value={opposingAdvocate}
                onChange={(e) => setOpposingAdvocate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD TIMELINE EVENT MODAL */}
      <Modal isOpen={isTimelineModalOpen} onClose={() => setIsTimelineModalOpen(false)} title="Log Timeline Event">
        <form onSubmit={handleAddTimeline} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Event / Milestone Title *</label>
            <input
              type="text"
              placeholder="e.g. Counter-Affidavit Filed"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={timelineTitle}
              onChange={(e) => setTimelineTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Event Date & Time *</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={timelineDate}
              onChange={(e) => setTimelineDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Event Description *</label>
            <textarea
              rows={3}
              placeholder="Provide context and notes about what occurred..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={timelineDesc}
              onChange={(e) => setTimelineDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsTimelineModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* SCHEDULE HEARING MODAL */}
      <Modal isOpen={isHearingModalOpen} onClose={() => setIsHearingModalOpen(false)} title="Schedule Court Hearing">
        <form onSubmit={handleScheduleHearing} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hearing Date & Time *</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hearing Purpose *</label>
            <input
              type="text"
              placeholder="e.g. Final Arguments or Evidence Cross Examination"
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              required
              value={hearingPurpose}
              onChange={(e) => setHearingPurpose(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judge Notes / Pre-Work (Optional)</label>
            <textarea
              rows={2}
              placeholder="List items or notes for prep..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={hearingNotes}
              onChange={(e) => setHearingNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsHearingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Hearing
            </Button>
          </div>
        </form>
      </Modal>

      {/* UPDATE HEARING STATUS MODAL */}
      <Modal isOpen={isUpdateHearingModalOpen} onClose={() => setIsUpdateHearingModalOpen(false)} title="Update Hearing Record">
        <form onSubmit={handleUpdateHearingStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
              value={hearingStatusUpdate}
              onChange={(e) => setHearingStatusUpdate(e.target.value)}
            >
              <option value="CONCLUDED">Concluded</option>
              <option value="ADJOURNED">Adjourned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hearing Outcome / Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Next hearing set for Arguments on..."
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950"
              value={hearingNotesUpdate}
              onChange={(e) => setHearingNotesUpdate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsUpdateHearingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Linked Document">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select File *</label>
            <input
              type="file"
              required
              className="w-full text-xs text-navy-950"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setUploadFile(e.target.files[0]);
                }
              }}
            />
            <p className="text-[10px] text-gray-400 mt-1">Acceptable formats: PDF, DOCX, JPG, PNG (Max 10MB)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
            <select
              className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            >
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="PROPERTY_DEED">Property Deed</option>
              <option value="COURT_ORDER">Court Order</option>
              <option value="AGREEMENT">Agreement / Contract</option>
              <option value="OTHER">Other / Miscellaneous</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
