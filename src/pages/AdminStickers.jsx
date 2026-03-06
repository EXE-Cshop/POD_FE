import React, { useEffect, useState } from 'react';
import { stickerService } from '../services/api';

const AdminStickers = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLink, setNewLink] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editLink, setEditLink] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchStickers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stickerService.getAll();
      const list = res.data?.data ?? res.data ?? [];
      setStickers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách sticker.');
      setStickers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const link = newLink?.trim();
    if (!link) return;
    setAddError(null);
    setAddLoading(true);
    try {
      await stickerService.create({ link });
      setNewLink('');
      fetchStickers();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Không thể thêm sticker.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const link = editLink?.trim();
    if (!link) return;
    try {
      await stickerService.update(id, { link });
      setEditingId(null);
      setEditLink('');
      fetchStickers();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Không thể cập nhật.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await stickerService.delete(id);
      setDeleteConfirmId(null);
      fetchStickers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể xóa.');
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditLink(s.link);
    setAddError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLink('');
  };

  return (
    <div className="flex-1 overflow-auto bg-background-light min-h-screen font-display text-slate-900">
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Quản lý Sticker</h1>
            <p className="text-slate-500 mt-1">Thêm, sửa, xóa sticker cho thư viện thiết kế.</p>
          </div>
        </div>

        {/* Add form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thêm sticker mới</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://example.com/sticker.svg"
              className="flex-1 h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
            <button
              type="submit"
              disabled={addLoading || !newLink?.trim()}
              className="h-12 px-6 rounded-lg bg-primary text-[#11221c] font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">add</span>
              )}
              Thêm
            </button>
          </form>
          {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        </div>

        {/* List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Danh sách sticker ({stickers.length})</h2>
          </div>
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">progress_activity</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : stickers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Chưa có sticker nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Preview</th>
                    <th className="px-6 py-4">Link</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stickers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm">{s.id}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                          <img src={s.link} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === s.id ? (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="flex-1 h-9 px-3 rounded border border-slate-200 text-sm"
                              autoFocus
                            />
                            <button onClick={() => handleUpdate(s.id)} className="px-3 py-1 bg-primary text-[#11221c] rounded text-sm font-bold">Lưu</button>
                            <button onClick={cancelEdit} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-bold">Hủy</button>
                          </div>
                        ) : (
                          <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate block max-w-[300px]">
                            {s.link}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === s.id ? null : (
                          <>
                            <button onClick={() => startEdit(s)} className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            {deleteConfirmId === s.id ? (
                              <span className="inline-flex gap-2 ml-2">
                                <button onClick={() => handleDelete(s.id)} className="text-red-600 text-sm font-bold">Xóa</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="text-slate-500 text-sm">Hủy</button>
                              </span>
                            ) : (
                              <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminStickers;
