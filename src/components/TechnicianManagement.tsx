import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Trash2, ShieldCheck, Wrench, Calendar, X, Plus, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Technician {
  id: number;
  name: string;
  email: string;
  completedTasks: number;
  avgCompletionTime: number | null;
}

interface Machine {
  id: number;
  name: string;
  qr_code: string;
  line: string;
}

const TechnicianManagement = ({ machines, onRefresh }: { machines: Machine[], onRefresh: () => void }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assigningTo, setAssigningTo] = useState<Technician | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [taskData, setTaskData] = useState({
    machine_id: '',
    type: 'Preventive',
    date: format(new Date(), 'yyyy-MM-dd'),
    checklist: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTechnicians = async (retries = 5) => {
    try {
      const res = await fetch('/api/technicians');
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchTechnicians(retries - 1), 3000);
      } else {
        console.error('Failed to fetch technicians after multiple attempts:', err);
      }
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', email: '', password: '' });
        fetchTechnicians();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add technician');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTo) return;
    setLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          technician_id: assigningTo.id
        })
      });
      if (res.ok) {
        setAssigningTo(null);
        setTaskData({
          machine_id: '',
          type: 'Preventive',
          date: format(new Date(), 'yyyy-MM-dd'),
          checklist: ''
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to assign task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Technician Management</h1>
          <p className="text-slate-500 text-sm">Manage your maintenance team and assign tasks directly.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <UserPlus size={18} />
          <span>Add New Technician</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800">New Technician Details</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              
              {error && <p className="text-rose-500 text-xs bg-rose-50 p-2 rounded-lg">{error}</p>}

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Mike Tech"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                    placeholder="tech@factory.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <input 
                    required
                    type="password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Technician'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assigningTo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full"
            >
              <form onSubmit={handleAssignTask} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-slate-800">Assign Task to {assigningTo.name}</h2>
                  <button type="button" onClick={() => setAssigningTo(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Machine</label>
                    <select 
                      required
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      value={taskData.machine_id}
                      onChange={e => setTaskData({...taskData, machine_id: e.target.value})}
                    >
                      <option value="">Select Machine</option>
                      {machines.map(m => <option key={m.id} value={m.id}>{m.qr_code} - {m.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      value={taskData.type}
                      onChange={e => setTaskData({...taskData, type: e.target.value})}
                    >
                      <option value="Preventive">Preventive</option>
                      <option value="Corrective">Corrective</option>
                      <option value="Routine">Routine</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      value={taskData.date}
                      onChange={e => setTaskData({...taskData, date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                    <textarea 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24"
                      placeholder="Task details..."
                      value={taskData.checklist}
                      onChange={e => setTaskData({...taskData, checklist: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAssigningTo(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <motion.div 
            layout
            key={tech.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Wrench size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                <ShieldCheck size={12} />
                <span>Verified Tech</span>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg mb-1">{tech.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
              <Mail size={14} />
              <span>{tech.email}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{tech.completedTasks}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Clock size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Time</span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {tech.avgCompletionTime ? `${tech.avgCompletionTime.toFixed(1)}h` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
              <button 
                onClick={() => setAssigningTo(tech)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Calendar size={14} />
                <span>Assign Task</span>
              </button>
              <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {technicians.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Wrench size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No technicians found</h3>
          <p className="text-slate-500 text-sm">Add your first technician to start assigning work.</p>
        </div>
      )}
    </div>
  );
};

export default TechnicianManagement;
