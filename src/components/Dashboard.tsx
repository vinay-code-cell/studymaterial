import { useState, useEffect } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import { getMaterials, logAccess } from '../lib/api';
import type { Material } from '../lib/supabase';

export default function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      setLoading(true);
      const data = await getMaterials(searchQuery);
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadMaterials();
  }

  async function handleDownload(material: Material) {
    try {
      await logAccess(material.id, material.file_name);
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Study Material Sharing Hub
          </h1>
          <p className="text-slate-600">
            Access and share study materials for first-year students
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No materials found</p>
            <p className="text-slate-500 text-sm mt-2">
              Try a different search or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-10 h-10 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-slate-500">
                      {formatDate(material.upload_date)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                    {material.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {material.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {formatFileSize(material.file_size)}
                    </span>
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
