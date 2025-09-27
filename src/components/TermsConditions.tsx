import React, { useState } from 'react';
import { Edit, Save, X, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface TermsSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

const TermsConditions: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({ title: '', content: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const [sections, setSections] = useState<TermsSection[]>([
    {
      id: '1',
      title: 'Ketentuan Umum',
      content: 'Dengan menggunakan layanan rental alat camping kami, Anda setuju untuk mematuhi syarat dan ketentuan yang berlaku. Layanan ini ditujukan untuk keperluan camping dan outdoor activities yang legal dan aman.',
      order: 1
    },
    {
      id: '2',
      title: 'Persyaratan Penyewaan',
      content: 'Penyewa harus berusia minimal 18 tahun atau didampingi oleh orang dewasa. Wajib menunjukkan identitas resmi (KTP/SIM/Paspor) yang masih berlaku. Pembayaran dapat dilakukan secara tunai atau transfer bank.',
      order: 2
    },
    {
      id: '3',
      title: 'Tanggung Jawab Penyewa',
      content: 'Penyewa bertanggung jawab penuh atas keamanan dan kondisi alat selama masa penyewaan. Segala kerusakan atau kehilangan akan dibebankan kepada penyewa sesuai dengan harga yang berlaku. Penyewa wajib mengembalikan alat dalam kondisi bersih dan utuh.',
      order: 3
    },
    {
      id: '4',
      title: 'Ketentuan Pembayaran',
      content: 'Pembayaran dilakukan di muka sebelum pengambilan alat. Untuk penyewaan di atas 3 hari, dapat dilakukan pembayaran dengan sistem deposit 50% dan pelunasan saat pengambilan. Biaya keterlambatan pengembalian adalah 20% dari harga sewa per hari.',
      order: 4
    },
    {
      id: '5',
      title: 'Pembatalan dan Pengembalian',
      content: 'Pembatalan dapat dilakukan maksimal 24 jam sebelum jadwal pengambilan dengan pengembalian 80% dari total pembayaran. Pembatalan di bawah 24 jam tidak mendapat pengembalian dana. Pengembalian alat harus tepat waktu sesuai kesepakatan.',
      order: 5
    },
    {
      id: '6',
      title: 'Force Majeure',
      content: 'Kami tidak bertanggung jawab atas keterlambatan atau ketidakmampuan memenuhi kewajiban akibat keadaan kahar (force majeure) seperti bencana alam, perang, atau kebijakan pemerintah yang di luar kendali kami.',
      order: 6
    }
  ]);

  const handleSaveSection = (sectionId: string, newTitle: string, newContent: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, title: newTitle, content: newContent }
          : section
      )
    );
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus bagian ini?')) {
      setSections(prev => prev.filter(section => section.id !== sectionId));
    }
  };

  const handleAddSection = () => {
    if (newSection.title && newSection.content) {
      const newId = Date.now().toString();
      setSections(prev => [...prev, {
        id: newId,
        title: newSection.title,
        content: newSection.content,
        order: prev.length + 1
      }]);
      setNewSection({ title: '', content: '' });
      setShowAddModal(false);
    }
  };

  const lastUpdated = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Syarat & Ketentuan</h2>
            <p className="text-gray-600">Kelola syarat dan ketentuan rental alat camping</p>
            <p className="text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Bagian
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isEditing 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Selesai Edit' : 'Edit Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert untuk mode editing */}
      {isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 font-medium">Mode Edit Aktif</p>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Anda dapat mengedit, menghapus, atau menambah bagian syarat & ketentuan. Klik tombol "Selesai Edit" untuk keluar dari mode ini.
          </p>
        </div>
      )}

      {/* Terms Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <TermsSectionCard
            key={section.id}
            section={section}
            isEditing={isEditing}
            editingSection={editingSection}
            onEdit={setEditingSection}
            onSave={handleSaveSection}
            onDelete={handleDeleteSection}
            onCancelEdit={() => setEditingSection(null)}
          />
        ))}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Bagian Baru</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSection({ title: '', content: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul bagian..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Masukkan konten bagian..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSection({ title: '', content: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSection}
                disabled={!newSection.title || !newSection.content}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah Bagian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Mode Info */}
      {!isEditing && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800 font-medium">Mode Preview</p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Ini adalah tampilan syarat & ketentuan yang akan dilihat oleh customer. Klik "Edit Mode" untuk melakukan perubahan.
          </p>
        </div>
      )}
    </div>
  );
};

// Komponen terpisah untuk setiap section
interface TermsSectionCardProps {
  section: TermsSection;
  isEditing: boolean;
  editingSection: string | null;
  onEdit: (sectionId: string) => void;
  onSave: (sectionId: string, title: string, content: string) => void;
  onDelete: (sectionId: string) => void;
  onCancelEdit: () => void;
}

const TermsSectionCard: React.FC<TermsSectionCardProps> = ({
  section,
  isEditing,
  editingSection,
  onEdit,
  onSave,
  onDelete,
  onCancelEdit
}) => {
  const [editTitle, setEditTitle] = useState(section.title);
  const [editContent, setEditContent] = useState(section.content);

  const isCurrentlyEditing = editingSection === section.id;

  const handleSave = () => {
    onSave(section.id, editTitle, editContent);
  };

  const handleCancel = () => {
    setEditTitle(section.title);
    setEditContent(section.content);
    onCancelEdit();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        {isCurrentlyEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {section.order}. {section.title}
              </h3>
              {isEditing && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(section.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed text-justify">
              {section.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditions;