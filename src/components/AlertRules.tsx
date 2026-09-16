import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Plus, Trash2, Edit2, Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AlertRules() {
  const { alertRules, addAlertRule, updateAlertRule, deleteAlertRule, sendEmail, user } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    threshold: 10,
    channel: 'email' as 'email' | 'webhook',
    enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateAlertRule(editingId, formData);
      toast.success('Alert rule updated');
      setEditingId(null);
    } else {
      addAlertRule(formData);
      toast.success('Alert rule created');
    }

    setFormData({ name: '', condition: '', threshold: 10, channel: 'email', enabled: true });
    setShowForm(false);
  };

  const handleEdit = (rule: any) => {
    setFormData({
      name: rule.name,
      condition: rule.condition,
      threshold: rule.threshold,
      channel: rule.channel,
      enabled: rule.enabled,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      deleteAlertRule(id);
      toast.success('Alert rule deleted');
    }
  };

  const handleTestAlert = async (rule: any) => {
    if (!user) return;

    const success = await sendEmail(
      user.email,
      `[TEST] Alert: ${rule.name}`
    );

    if (success) {
      toast.success('Test alert sent to your email');
    } else {
      toast.error('Email rate limit reached (100/day)');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#ededed] mb-1">Alert Rules</h2>
          <p className="text-[11px] text-[#525252]">
            Configure alerts for critical events · Powered by Resend (100 emails/day free)
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', condition: '', threshold: 10, channel: 'email', enabled: true });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
        >
          <Plus className="w-3 h-3" />
          New Rule
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#262626] rounded">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                placeholder="Critical attack detected"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                required
              >
                <option value="">Select condition...</option>
                <option value="severity_critical">Severity = Critical</option>
                <option value="severity_high">Severity = High</option>
                <option value="attack_ddos">Attack Type = DDoS</option>
                <option value="attack_sql">Attack Type = SQL Injection</option>
                <option value="status_active">Status = Active</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                  Threshold
                </label>
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#a3a3a3] uppercase tracking-wider mb-1.5">
                  Channel
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as 'email' | 'webhook' })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-[#262626] rounded text-sm text-[#ededed] focus:outline-none focus:border-[#404040]"
                >
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-[#262626] bg-[#141414]"
              />
              <label htmlFor="enabled" className="text-sm text-[#a3a3a3]">
                Enable this rule
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ededed] text-[#0a0a0a] rounded text-xs font-medium hover:bg-[#d4d4d4] transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Rule
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-1.5 border border-[#262626] text-[#a3a3a3] rounded text-xs hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {alertRules.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-[#404040] mx-auto mb-3" />
          <p className="text-[#525252] text-sm mb-1">No alert rules yet</p>
          <p className="text-[#404040] text-xs">Create your first alert rule to get notified</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alertRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 bg-[#0a0a0a] border border-[#262626] rounded hover:border-[#404040] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#ededed] truncate">{rule.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      rule.enabled ? 'bg-green-500/10 text-green-500' : 'bg-[#262626] text-[#525252]'
                    }`}>
                      {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a3a3a3] mb-1">
                    {rule.condition.replace('_', ' ')} ≥ {rule.threshold}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#525252]">
                    <span>Channel: {rule.channel}</span>
                    {rule.lastTriggered && (
                      <span>
                        Last triggered: {formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTestAlert(rule)}
                    className="p-1.5 text-[#525252] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded transition-colors"
                    title="Test alert"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-1.5 text-[#525252] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
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
