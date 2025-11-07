import { useState, useEffect } from 'react';
import { Upload, Clock, Trash2, Globe, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { uploadMaterial, getAccessLogs, getAllMaterials, deleteMaterial, approveMaterial, rejectMaterial, getPendingMaterials } from '../lib/api';
import { getAdminSession, logoutAdmin } from '../lib/auth';
import type { AccessLog, Material } from '../lib/supabase';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'approval' | 'logs' | 'manage'>('approval');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const admin = getAdminSession();

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    } else if (activeTab === 'manage') {
      loadMaterials();
    } else if (activeTab === 'approval') {
      loadPendingMaterials();
    }
  }, [activeTab]);

  async function loadPendingMaterials() {
    try {
      setLoading(true);
      const data = await getPendingMaterials();
      setPendingMaterials(data || []);
    } catch (error) {
      console.error('Error loading pending materials:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await getAccessLogs();
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMaterials() {
    try {
      setLoading(true);
      const data = await getAllMaterials();
      setAllMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    try {
      setUploading(true);
      await uploadMaterial(title, description, file);
      setTitle('');
      setDescription('');
      setFile(null);
      alert('Material uploaded successfully! It will appear after admin approval.');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading material. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleApprove(materialId: string) {
    if (!admin) return;
    try {
      await approveMaterial(materialId, admin.adminId);
      await loadPendingMaterials();
      alert('Material approved successfully!');
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving material. Please try again.');
    }
  }

  async function handleReject(materialId: string) {
    if (!confirm('Are you sure you want to reject this material?')) return;
    try {
      await rejectMaterial(materialId);
      await loadPendingMaterials();
      alert('Material rejected.');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting material. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await deleteMaterial(id);
      setAllMaterials(allMaterials.filter((m) => m.id !== id));
      alert('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting material. Please try again.');
    }
  }

  function handleLogout() {
    logoutAdmin();
    onLogout();
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" />Rejected</span>;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Panel</h1>
            <p className="text-slate-600">
              {admin?.adminIdNumber && `Admin ID: ${admin.adminIdNumber.toString()}`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('approval')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'approval'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Review Materials
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Upload Material
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Manage Materials
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Access Logs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'approval' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Materials for Approval</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : pendingMaterials.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No pending materials</p>
                ) : (
                  <div className="space-y-4">
                    {pendingMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">{material.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {material.description || 'No description'}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Uploaded: {formatDateTime(material.upload_date)}
                            </p>
                          </div>
                          {getStatusBadge(material.status)}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(material.id)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(material.id)}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <form onSubmit={handleUpload} className="max-w-2xl">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Physics Chapter 1 Notes"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the material..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PDF File *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {file && (
                      <p className="mt-2 text-sm text-slate-600">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file || !title.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Material'}
                </button>
              </form>
            )}

            {activeTab === 'manage' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">All Materials</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : allMaterials.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No materials</p>
                ) : (
                  <div className="space-y-4">
                    {allMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-800">{material.title}</h3>
                            {getStatusBadge(material.status)}
                          </div>
                          <p className="text-sm text-slate-600">
                            {material.description || 'No description'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Uploaded: {formatDateTime(material.upload_date)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete material"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Access Logs</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No access logs yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Time
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                            File Name
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                            <Globe className="w-4 h-4 inline mr-2" />
                            IP Address
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {formatDateTime(log.access_time)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-800">
                              {log.file_name}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                              {log.ip_address}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
