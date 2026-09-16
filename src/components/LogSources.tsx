import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Plus, Trash2, Copy, RefreshCw, Key, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function LogSources() {
  const { logSources, addLogSource, deleteLogSource, regenerateApiKey } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'api' as 'api' | 'upload' | 'webhook',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLogSource({
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      enabled: true,
    });
    toast.success('Log source created');
    setFormData({ name: '', description: '', type: 'api' });
    setShowForm(false);
  };

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateKey = (sourceId: string) => {
    if (confirm('Are you sure? This will invalidate the current API key.')) {
      regenerateApiKey(sourceId);
      toast.success('API key regenerated');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#ededed] mb-1">Log Sources</h2>
          <p className="text-[11px] text-[#525252]">
            Manage your log ingestion sources · Store in Supabase
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Source
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#262626] rounded">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Source Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                placeholder="Production API"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                placeholder="Main production environment logs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Source Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
              >
                <option value="api">API Ingestion</option>
                <option value="upload">File Upload</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
              >
                Create Source
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

      {logSources.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-[#404040] mx-auto mb-3" />
          <p className="text-[#525252] text-sm mb-1">No log sources yet</p>
          <p className="text-[#404040] text-xs">Create your first log source to start ingesting logs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logSources.map((source) => (
            <div
              key={source.id}
              className="p-4 bg-[#0a0a0a] border border-[#262626] rounded hover:border-[#404040] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#ededed]">{source.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      source.enabled ? 'bg-green-500/10 text-green-500' : 'bg-[#262626] text-[#525252]'
                    }`}>
                      {source.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  {source.description && (
                    <p className="text-[11px] text-[#a3a3a3] mb-2">{source.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[#525252]">
                    <span>Type: {source.type}</span>
                    <span>Created: {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Delete this log source?')) {
                      deleteLogSource(source.id);
                      toast.success('Source deleted');
                    }
                  }}
                  className="p-1.5 text-[#525252] hover:text-red-500 hover:bg-[#1a1a1a] rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* API Key Section */}
              <div className="pt-3 border-t border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#a3a3a3] uppercase tracking-wider">API Key</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyApiKey(source.apiKey)}
                      className="p-1 text-[#525252] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded transition-colors"
                      title="Copy API key"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRegenerateKey(source.id)}
                      className="p-1 text-[#525252] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded transition-colors"
                      title="Regenerate API key"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-[#141414] border border-[#262626] rounded font-mono text-[11px]">
                  <code className="text-[#a3a3a3] truncate flex-1">{source.apiKey}</code>
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-[10px] text-[#525252]">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Keep this key secure. Anyone with this key can ingest logs to this source.</span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mt-3 pt-3 border-t border-[#262626] grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] text-[#525252] uppercase tracking-wider mb-1">Logs Today</div>
                  <div className="text-sm text-[#ededed] font-mono">{source.stats.logsToday}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#525252] uppercase tracking-wider mb-1">Size Today</div>
                  <div className="text-sm text-[#ededed] font-mono">{source.stats.sizeToday}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#525252] uppercase tracking-wider mb-1">Last Ingest</div>
                  <div className="text-sm text-[#ededed] font-mono">
                    {source.stats.lastIngest ? formatDistanceToNow(new Date(source.stats.lastIngest), { addSuffix: true }) : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
