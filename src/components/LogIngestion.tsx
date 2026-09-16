import { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { Upload, FileText, Clipboard, Code, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogIngestion() {
  const { logSources, ingestLogs } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'api'>('upload');
  const [selectedSource, setSelectedSource] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!selectedSource) {
      toast.error('Please select a log source first');
      return;
    }

    setUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Parse files and ingest
    const file = files[0];
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    const logs = lines.map((line, idx) => ({
      id: `LOG-UPLOAD-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      sourceIP: '127.0.0.1',
      destinationIP: '10.0.0.1',
      sourcePort: Math.floor(Math.random() * 65535),
      destinationPort: 80,
      protocol: 'TCP',
      attackType: 'Port Scan',
      severity: 'medium' as const,
      status: 'active' as const,
      description: line.substring(0, 100),
      payload: line,
      country: 'US',
      firewall: 'FW-Primary',
      signature: `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    }));

    ingestLogs(logs);
    setUploading(false);
    toast.success(`Ingested ${logs.length} logs from ${file.name}`);
  };

  const handlePaste = () => {
    if (!selectedSource) {
      toast.error('Please select a log source first');
      return;
    }

    if (!pasteContent.trim()) {
      toast.error('Please paste some log content');
      return;
    }

    const lines = pasteContent.split('\n').filter(line => line.trim());
    
    const logs = lines.map((line, idx) => ({
      id: `LOG-PASTE-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      sourceIP: '127.0.0.1',
      destinationIP: '10.0.0.1',
      sourcePort: Math.floor(Math.random() * 65535),
      destinationPort: 80,
      protocol: 'TCP',
      attackType: 'Port Scan',
      severity: 'medium' as const,
      status: 'active' as const,
      description: line.substring(0, 100),
      payload: line,
      country: 'US',
      firewall: 'FW-Primary',
      signature: `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    }));

    ingestLogs(logs);
    setPasteContent('');
    toast.success(`Ingested ${logs.length} logs`);
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#ededed] mb-1">Log Ingestion</h2>
        <p className="text-[11px] text-[#525252]">
          Upload files, paste logs, or use API to ingest logs · Stored in Axiom
        </p>
      </div>

      {/* Source Selector */}
      <div className="mb-4">
        <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
          Select Log Source
        </label>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
        >
          <option value="">Choose a source...</option>
          {logSources.map(source => (
            <option key={source.id} value={source.id}>
              {source.name} ({source.type})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-[#262626]">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2 text-sm flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'upload' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          File Upload
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`pb-2 text-sm flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'paste' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          Paste Logs
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-2 text-sm flex items-center gap-1.5 transition-colors relative ${
            activeTab === 'api' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          API
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-[#262626] hover:border-[#404040]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".log,.txt,.json,.csv,.gz,.zip"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {uploading ? (
              <div>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                <p className="text-sm text-[#ededed] mb-1">Uploading...</p>
                <p className="text-[11px] text-[#525252]">Processing logs</p>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 text-[#404040] mx-auto mb-4" />
                <p className="text-sm text-[#ededed] mb-1">
                  Drag & drop log files here
                </p>
                <p className="text-[11px] text-[#525252] mb-4">
                  Supported: .log, .txt, .json, .csv, .gz, .zip
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-[#0a0a0a] border border-[#262626] rounded">
            <p className="text-[11px] text-[#525252]">
              <strong className="text-[#a3a3a3]">Tip:</strong> Each line in your file will be treated as a separate log entry. 
              Max file size: 10 MB (free tier).
            </p>
          </div>
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div>
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste your logs here (one per line)..."
            className="w-full h-48 px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded text-sm text-[#ededed] font-mono placeholder-[#525252] focus:outline-none focus:border-[#404040] resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-[#525252]">
              {pasteContent.split('\n').filter(l => l.trim()).length} lines
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPasteContent('')}
                className="px-3 py-1.5 border border-[#262626] text-[#a3a3a3] rounded text-xs hover:bg-[#1a1a1a] transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handlePaste}
                className="px-4 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
              >
                Ingest Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded mb-4">
            <h3 className="text-sm font-medium text-[#ededed] mb-2">REST API Endpoint</h3>
            <div className="flex items-center gap-2 p-2 bg-[#141414] border border-[#262626] rounded font-mono text-[11px]">
              <code className="text-amber-500">POST</code>
              <code className="text-[#a3a3a3] flex-1">https://api.cybershield.app/v1/logs/ingest</code>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded mb-4">
            <h3 className="text-sm font-medium text-[#ededed] mb-2">Example Request</h3>
            <pre className="p-3 bg-[#141414] border border-[#262626] rounded font-mono text-[11px] text-[#a3a3a3] overflow-x-auto">
{`curl -X POST https://api.cybershield.app/v1/logs/ingest \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "logs": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "level": "error",
        "message": "Connection failed",
        "source": "production-api"
      }
    ]
  }'`}
            </pre>
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded">
            <p className="text-[11px] text-amber-400">
              <strong>Note:</strong> API ingestion is rate limited to 1000 requests/minute (free tier). 
              Use your log source API key for authentication.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
