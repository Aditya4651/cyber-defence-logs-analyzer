import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Plus, Trash2, Copy, RefreshCw, AlertCircle, Search, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { LOG_SOURCE_TYPES, LOG_SOURCE_CATEGORIES, getLogSourceTypeById, LogSourceTypeConfig } from '../data/logSourceTypes';

export default function LogSources() {
  const { logSources, addLogSource, deleteLogSource, regenerateApiKey } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<LogSourceTypeConfig | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeSearch, setTypeSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config: {
      endpoint: '',
      port: 0,
      protocol: '',
      format: '',
    },
  });

  const filteredTypes = LOG_SOURCE_TYPES.filter(type => {
    const matchesCategory = categoryFilter === 'all' || type.category === categoryFilter;
    const matchesSearch = type.name.toLowerCase().includes(typeSearch.toLowerCase()) ||
                         type.description.toLowerCase().includes(typeSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTypeSelect = (type: LogSourceTypeConfig) => {
    setSelectedType(type);
    setFormData({
      name: '',
      description: type.description,
      config: {
        endpoint: '',
        port: type.defaultPort || 514,
        protocol: type.defaultProtocol || 'Syslog',
        format: type.sampleFormat,
      },
    });
    setShowTypeSelector(false);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    addLogSource({
      name: formData.name,
      description: formData.description || undefined,
      type: selectedType.id as any,
      category: selectedType.category as any,
      enabled: true,
      config: formData.config,
    });

    toast.success(`Log source "${formData.name}" created`);
    setFormData({ name: '', description: '', config: { endpoint: '', port: 0, protocol: '', format: '' } });
    setSelectedType(null);
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
            {logSources.length} sources configured · 17 source types available
          </p>
        </div>
        <button
          onClick={() => setShowTypeSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Source
        </button>
      </div>

      {/* Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTypeSelector(false)}></div>
          <div className="relative w-full max-w-4xl glass-card rounded-lg overflow-hidden glow-cyan max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Select Log Source Type</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Choose the type of log source you want to add</p>
              </div>
              <button onClick={() => setShowTypeSelector(false)} className="p-1 hover:bg-gray-800 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-800 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input
                  type="text"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder="Search source types..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#262626] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="px-4 py-2 border-b border-gray-800 flex gap-1 overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider whitespace-nowrap ${
                  categoryFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                All
              </button>
              {LOG_SOURCE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1 ${
                    categoryFilter === cat.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Type Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type)}
                      className="p-3 bg-[#0a0a0a] border border-[#262626] rounded hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left group"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="p-1.5 rounded"
                          style={{ backgroundColor: `${type.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: type.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-medium text-white truncate">{type.name}</h4>
                            <ChevronRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{type.description}</p>
                          {type.defaultPort && (
                            <div className="mt-1.5 text-[9px] text-gray-600 font-mono">
                              :{type.defaultPort} · {type.defaultProtocol}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {filteredTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No source types match your search
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && selectedType && (
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#262626] rounded">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#262626]">
            <div
              className="p-1.5 rounded"
              style={{ backgroundColor: `${selectedType.color}20` }}
            >
              <selectedType.icon className="w-4 h-4" style={{ color: selectedType.color }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{selectedType.name}</h3>
              <p className="text-[10px] text-gray-500">{selectedType.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Source Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white focus:outline-none focus:border-cyan-500/40"
                placeholder={`e.g., ${selectedType.name} - Production`}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white focus:outline-none focus:border-cyan-500/40"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.config.port}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, port: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                  Protocol
                </label>
                <input
                  type="text"
                  value={formData.config.protocol}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, protocol: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Endpoint / Hostname
              </label>
              <input
                type="text"
                value={formData.config.endpoint}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, endpoint: e.target.value }
                })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
                placeholder="e.g., logs.example.com or 10.0.0.1"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Sample Format
              </label>
              <div className="p-2 bg-[#141414] border border-[#262626] rounded text-[10px] text-gray-400 font-mono break-all">
                {selectedType.sampleFormat}
              </div>
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
                onClick={() => { setShowForm(false); setSelectedType(null); }}
                className="px-4 py-1.5 border border-[#262626] text-[#a3a3a3] rounded text-xs hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources List */}
      {logSources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#404040]" />
          </div>
          <p className="text-[#525252] text-sm mb-1">No log sources yet</p>
          <p className="text-[#404040] text-xs mb-4">Add your first log source to start ingesting data</p>
          <button
            onClick={() => setShowTypeSelector(true)}
            className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-xs hover:bg-cyan-500/20 transition-colors"
          >
            Browse Source Types
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logSources.map((source) => {
            const typeConfig = getLogSourceTypeById(source.type);
            const Icon = typeConfig?.icon || Plus;
            const color = typeConfig?.color || '#64748b';

            return (
              <div
                key={source.id}
                className="p-4 bg-[#0a0a0a] border border-[#262626] rounded hover:border-[#404040] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className="p-2 rounded"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-white">{source.name}</h3>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          source.enabled ? 'bg-green-500/10 text-green-500' : 'bg-[#262626] text-[#525252]'
                        }`}>
                          {source.enabled ? 'Active' : 'Disabled'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-gray-500 uppercase">
                          {typeConfig?.name || source.type}
                        </span>
                      </div>
                      {source.description && (
                        <p className="text-[11px] text-gray-500 mb-2">{source.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
                        {source.config?.port && <span>:{source.config.port}</span>}
                        {source.config?.protocol && <span>{source.config.protocol}</span>}
                        {source.config?.endpoint && <span>{source.config.endpoint}</span>}
                        <span>Created {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this log source?')) {
                        deleteLogSource(source.id);
                        toast.success('Source deleted');
                      }
                    }}
                    className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-[#1a1a1a] rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* API Key */}
                <div className="pt-3 border-t border-[#262626]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">API Key</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyApiKey(source.apiKey)}
                        className="p-1 text-gray-600 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(source.id)}
                        className="p-1 text-gray-600 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#141414] border border-[#262626] rounded font-mono text-[10px]">
                    <code className="text-gray-400 truncate flex-1">{source.apiKey}</code>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 pt-3 border-t border-[#262626] grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Logs Today</div>
                    <div className="text-xs text-white font-mono tabular-nums">{source.stats.logsToday.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Size Today</div>
                    <div className="text-xs text-white font-mono tabular-nums">{source.stats.sizeToday}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Last Ingest</div>
                    <div className="text-xs text-white font-mono">
                      {source.stats.lastIngest ? formatDistanceToNow(new Date(source.stats.lastIngest), { addSuffix: true }) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
