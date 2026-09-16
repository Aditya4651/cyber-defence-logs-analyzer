import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Bookmark, Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedSearchesProps {
  onApplySearch?: (query: string) => void;
}

export default function SavedSearches({ onApplySearch }: SavedSearchesProps) {
  const { savedSearches, addSavedSearch, deleteSavedSearch } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavedSearch({ name, query });
    toast.success('Search saved');
    setName('');
    setQuery('');
    setShowForm(false);
  };

  const handleApply = (searchQuery: string) => {
    if (onApplySearch) {
      onApplySearch(searchQuery);
      toast.success('Search applied');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#ededed] mb-1">Saved Searches</h2>
          <p className="text-[11px] text-[#525252]">
            Quick access to your frequently used queries · Stored in Supabase
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Save Search
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#262626] rounded">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                placeholder="Critical attacks from China"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] font-mono focus:outline-none focus:border-[#404040]"
                placeholder='severity:critical AND country:"CN"'
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-1.5 border border-[#262626] text-[#a3a3a3] rounded text-xs hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {savedSearches.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 text-[#404040] mx-auto mb-3" />
          <p className="text-[#525252] text-sm mb-1">No saved searches</p>
          <p className="text-[#404040] text-xs">Save your frequently used queries for quick access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="p-3 bg-[#0a0a0a] border border-[#262626] rounded hover:border-[#404040] transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#ededed] mb-1">{search.name}</h3>
                  <p className="text-[11px] text-[#a3a3a3] font-mono truncate">{search.query}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleApply(search.query)}
                    className="p-1.5 text-[#525252] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded transition-colors"
                    title="Apply search"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this saved search?')) {
                        deleteSavedSearch(search.id);
                        toast.success('Search deleted');
                      }
                    }}
                    className="p-1.5 text-[#525252] hover:text-red-500 hover:bg-[#1a1a1a] rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
