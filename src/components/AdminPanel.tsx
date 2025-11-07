import { useState, useEffect } from 'react';
import { Upload, Clock, Trash2, Globe } from 'lucide-react';
import { uploadMaterial, getAccessLogs, getMaterials, deleteMaterial } from '../lib/api';
import type { AccessLog, Material } from '../lib/supabase';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'upload' | 'logs' | 'manage'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    } else if (activeTab === 'manage') {
      loadMaterials();
    }
  }, [activeTab]);

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
      const data = await getMaterials();
      setMaterials(data || []);
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
      alert('Material uploaded successfully!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading material. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await deleteMaterial(id);
      setMaterials(materials.filter((m) => m.id !== id));
      alert('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting material. Please try again.');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage study materials and view access logs</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex">
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
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : materials.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No materials uploaded yet</p>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-800">{material.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {material.description || 'No description'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Uploaded: {formatDateTime(material.upload_date)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
