import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentService, Document } from '../services/documentService';
import { caseService, Case } from '../services/caseService';
import {
  FiFileText, FiUpload, FiDownload, FiTrash2, FiSearch,
  FiFile, FiImage, FiGrid, FiLink, FiSliders, FiAlertCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Documents() {
  const { user } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  // Data State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [caseFilter, setCaseFilter] = useState('');

  // Upload Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [category, setCategory] = useState('COURT_ORDER');
  const [caseId, setCaseId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const docList = await documentService.getDocuments();
      setDocuments(docList);

      const caseList = await caseService.getCases();
      setCases(caseList);
    } catch (err) {
      toast.error('Failed to load documents vault data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const selectedCaseId = caseId ? parseInt(caseId) : undefined;
      await documentService.uploadDocument(uploadFile, category, selectedCaseId);
      toast.success('Document uploaded successfully');
      setIsUploadOpen(false);
      setUploadFile(null);
      setCaseId('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDownload = async (docId: number, originalFilename: string) => {
    try {
      await documentService.downloadDocument(docId, originalFilename);
      toast.success('Download initialized');
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (docId: number) => {
    if (confirm('CAUTION: Are you sure you want to delete this document from the vault? This cannot be undone.')) {
      try {
        await documentService.deleteDocument(docId);
        toast.success('Document deleted');
        loadData();
      } catch (err) {
        toast.error('Failed to delete document');
      }
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <FiImage className="w-8 h-8 text-indigo-500" />;
    }
    if (contentType === 'application/pdf') {
      return <FiFileText className="w-8 h-8 text-red-500" />;
    }
    return <FiFile className="w-8 h-8 text-amber-500" />;
  };

  if (loading && documents.length === 0) return <LoadingSpinner fullPage />;

  // Apply filters
  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.originalFilename.toLowerCase().includes(search.toLowerCase()) ||
      (doc.caseTitle && doc.caseTitle.toLowerCase().includes(search.toLowerCase())) ||
      (doc.ownerName && doc.ownerName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter ? doc.category === categoryFilter : true;
    const matchesCase = caseFilter ? doc.caseId?.toString() === caseFilter : true;

    return matchesSearch && matchesCategory && matchesCase;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Document Vault</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLawyer 
              ? 'Secure document storage with client identity proof categorizations.' 
              : 'Securely upload Aadhaar, PAN cards, property deeds, or case documents.'}
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} variant="primary" size="sm">
          <FiUpload className="mr-1" /> Upload File
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="py-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Filename, Case Title, or Uploader..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <FiSliders className="w-4 h-4" /> Filters:
            </div>
            <select
              className="rounded-xl border-gray-200 text-xs bg-white py-2 px-3 flex-1 sm:flex-initial"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="PROPERTY_DEED">Property Deed</option>
              <option value="COURT_ORDER">Court Order</option>
              <option value="AGREEMENT">Agreement</option>
              <option value="OTHER">Other / Misc</option>
            </select>
            <select
              className="rounded-xl border-gray-200 text-xs bg-white py-2 px-3 flex-1 sm:flex-initial"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            >
              <option value="">All Case Files</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FiFileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-navy-950 mb-1">No Documents Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Upload identity documents or case files to keep your vault organized.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-3">
                {/* Icon and action buttons */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gold-50/40 transition-colors">
                    {getFileIcon(doc.contentType)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc.id, doc.originalFilename)}
                      className="p-2 rounded-xl text-navy-600 hover:bg-navy-50 transition-colors"
                      title="Download File"
                    >
                      <FiDownload className="w-4.5 h-4.5" />
                    </button>
                    {(isLawyer || doc.ownerId === user?.id) && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete File"
                      >
                        <FiTrash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h4 className="text-xs font-bold text-navy-950 truncate" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </h4>
                  <p className="text-[10px] text-gray-400">Size: {(doc.size / 1024).toFixed(1)} KB</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gold-50 text-gold-600 uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3.5 space-y-2 text-[10px] text-gray-500">
                {doc.caseId && (
                  <div className="flex items-center gap-1 text-navy-950 font-medium">
                    <FiLink className="text-gray-400" />
                    <Link to={`/cases/${doc.caseId}`} className="hover:text-gold-600 transition-colors truncate">
                      {doc.caseTitle}
                    </Link>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Uploaded by:</span>
                  <span className="text-navy-950 font-semibold">{doc.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Secure Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-gold-500 bg-gold-50/20'
                : 'border-gray-200 hover:border-gold-500 hover:bg-gray-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadFile ? (
              <div className="space-y-2">
                <FiFileText className="w-12 h-12 text-gold-500 mx-auto" />
                <p className="text-sm font-bold text-navy-950 truncate max-w-xs mx-auto">
                  {uploadFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(uploadFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadFile(null);
                  }}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FiUpload className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-navy-950">
                  Drag and drop your file here, or <span className="text-gold-600 hover:underline">browse</span>
                </p>
                <p className="text-xs text-gray-400">
                  Acceptable: PDF, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category *</label>
              <select
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="PROPERTY_DEED">Property Deed</option>
                <option value="COURT_ORDER">Court Order</option>
                <option value="AGREEMENT">Agreement / Contract</option>
                <option value="OTHER">Other / Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link to Case (Optional)</label>
              <select
                className="w-full rounded-xl border-gray-200 text-sm text-navy-950 bg-white"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
              >
                <option value="">-- No Case Link --</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!uploadFile}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
