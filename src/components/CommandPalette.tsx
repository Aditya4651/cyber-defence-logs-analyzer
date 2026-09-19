import { useState, useEffect } from 'react';
import { Search, Terminal, Shield, Settings, Activity, Download, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: any;
  action: () => void;
  category: string;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View threat overview and analytics',
      icon: Shield,
      action: () => onNavigate('dashboard'),
      category: 'Navigation',
    },
    {
      id: 'logs',
      label: 'Go to Log Explorer',
      description: 'Search and analyze security logs',
      icon: Activity,
      action: () => onNavigate('logs'),
      category: 'Navigation',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      description: 'Configure alerts and preferences',
      icon: Settings,
      action: () => onNavigate('settings'),
      category: 'Navigation',
    },
    {
      id: 'export',
      label: 'Export Logs',
      description: 'Download logs as CSV',
      icon: Download,
      action: () => {
        // Trigger export
        const event = new CustomEvent('export-logs');
        window.dispatchEvent(event);
        onClose();
      },
      category: 'Actions',
    },
    {
      id: 'terminal',
      label: 'Open Terminal Mode',
      description: 'Advanced query interface',
      icon: Terminal,
      action: () => {
        onNavigate('logs');
        onClose();
      },
      category: 'Actions',
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Command palette */}
      <div className="relative w-full max-w-2xl glass-card rounded-lg overflow-hidden glow-cyan">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Commands list */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No commands found
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all ${
                    idx === selectedIndex
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <cmd.icon className={`w-5 h-5 ${
                    idx === selectedIndex ? 'text-cyan-400' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`text-sm ${
                      idx === selectedIndex ? 'text-white' : 'text-gray-300'
                    }`}>
                      {cmd.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cmd.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {cmd.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">esc</kbd> Close
            </span>
          </div>
          <div>
            {filteredCommands.length} commands
          </div>
        </div>
      </div>
    </div>
  );
}
