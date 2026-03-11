import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Wrench, 
  AlertTriangle, 
  Package, 
  Users, 
  QrCode, 
  BarChart3, 
  Plus, 
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Factory,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  Info,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotificationCenter } from './components/NotificationCenter';
import TechnicianManagement from './components/TechnicianManagement';
import { Stats, Machine, Breakdown, SparePart, SparePartUsage, User, MachineHistory, Maintenance } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-slate-100", className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
};

// --- Pages ---

const Dashboard = ({ stats, onAddMachine, onScanClick }: { stats: Stats | null; onAddMachine: () => void; onScanClick: () => void }) => {
  if (!stats) return null;

  const data = [
    { name: 'Mon', breakdowns: 4, maintenance: 2 },
    { name: 'Tue', breakdowns: 3, maintenance: 5 },
    { name: 'Wed', breakdowns: 2, maintenance: 3 },
    { name: 'Thu', breakdowns: 6, maintenance: 4 },
    { name: 'Fri', breakdowns: 1, maintenance: 6 },
    { name: 'Sat', breakdowns: 3, maintenance: 2 },
  ];

  const pieData = [
    { name: 'Running', value: stats.runningMachines, color: '#10b981' },
    { name: 'Repair', value: stats.repairMachines, color: '#f43f5e' },
    { name: 'Maint. Due', value: stats.maintenanceDue, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Operational Overview</h1>
        <div className="flex gap-2">
          <button 
            onClick={onScanClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
          >
            <QrCode size={18} />
            <span>Scan Machine</span>
          </button>
          <button 
            onClick={onAddMachine}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={18} />
            <span>Add Machine</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Factory size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalMachines}</p>
          </div>
        </Card>
        <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Running</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.runningMachines}</p>
          </div>
        </Card>
        <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Repair</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.repairMachines}</p>
          </div>
        </Card>
        <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Due</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.maintenanceDue}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <h3 className="text-lg font-semibold mb-6">Maintenance vs Breakdowns</h3>
          <div className="h-[250px] sm:h-[300px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="breakdowns" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="maintenance" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-6">Machine Status</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MachineList = ({ 
  machines, 
  onMachineClick,
  onEdit,
  onDelete,
  onScanClick
}: { 
  machines: Machine[]; 
  onMachineClick: (machine: Machine) => void;
  onEdit: (machine: Machine) => void;
  onDelete: (machine: Machine) => void;
  onScanClick: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const machineTypes = ['All', 'Sewing Machine', 'Overlock Machine', 'Cutting Machine', 'Finishing Machine', 'Multi-needle'];

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = 
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      machine.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All' || machine.type === selectedType;
    return matchesSearch && matchesType;
  });

  const downloadQRCode = (machine: Machine) => {
    const qrCanvas = document.getElementById(`qr-${machine.qr_code}`) as HTMLCanvasElement;
    if (qrCanvas) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const qrSize = 512;
      const padding = 60;
      const footerHeight = 120;
      
      canvas.width = qrSize + (padding * 2);
      canvas.height = qrSize + footerHeight + (padding * 2);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR Code (scaled up but sharp)
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);
      
      // Draw Text
      ctx.imageSmoothingEnabled = true;
      ctx.textAlign = 'center';
      
      // Machine ID
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(machine.qr_code, canvas.width / 2, qrSize + padding + 50);
      
      // Machine Name
      ctx.fillStyle = '#64748b';
      ctx.font = '24px sans-serif';
      ctx.fillText(machine.name, canvas.width / 2, qrSize + padding + 90);

      // Border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR_${machine.qr_code}.png`;
      link.href = url;
      link.click();
    }
  };

  const downloadMachinesPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Machine Inventory Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 30);
    doc.text(`Total Machines: ${filteredMachines.length}`, 14, 35);
    
    const tableData = filteredMachines.map(m => [
      m.qr_code,
      m.name,
      m.type,
      m.model,
      m.serial_number,
      m.status.replace('_', ' ').toUpperCase()
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Name', 'Type', 'Model', 'Serial No', 'Status']],
      body: tableData,
      foot: [['Total Machines', '', '', '', '', filteredMachines.length.toString()]],
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
      styles: { fontSize: 8 }
    });
    
    doc.save(`machine-inventory-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Machine Inventory</h1>
          <Badge variant="info">{filteredMachines.length} Machines Found</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, QR, serial, or type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-sm transition-all"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-600 shadow-sm cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
            >
              {machineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 flex gap-2">
            {(searchQuery || selectedType !== 'All') && (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                Clear
              </button>
            )}
            <button 
              onClick={downloadMachinesPDF}
              className="px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              title="Download Inventory PDF"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={onScanClick}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm flex items-center justify-center transition-colors"
              title="Open QR Scanner"
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="hover:border-indigo-200 transition-colors cursor-pointer group p-5 flex flex-col">
            <div onClick={() => onMachineClick(machine)} className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                  <Factory className="text-slate-400 group-hover:text-indigo-500" size={20} />
                </div>
                <Badge variant={
                  machine.status === 'running' ? 'success' : 
                  machine.status === 'under_repair' ? 'danger' : 'warning'
                }>
                  {machine.status.replace('_', ' ')}
                </Badge>
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-1">{machine.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">{machine.type}</p>
              
              <div className="grid grid-cols-1 gap-4 text-[10px] sm:text-xs text-slate-500 border-t border-slate-50 pt-4">
                <div>
                  <p className="uppercase tracking-wider font-semibold mb-1">Serial</p>
                  <p className="text-slate-800 font-medium truncate">{machine.serial_number}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(machine);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Machine"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(machine);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Machine"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-1 bg-white border border-slate-100 rounded-lg">
                  <QRCodeCanvas 
                    id={`qr-${machine.qr_code}`}
                    value={machine.qr_code} 
                    size={64}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{machine.qr_code}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  downloadQRCode(machine);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <QrCode size={14} />
                Download
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Scanner = ({ onScan }: { onScan: (decodedText: string) => void }) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    try {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        videoConstraints: {
          facingMode: "environment"
        }
      }, false);

      scanner.render((decodedText) => {
        setScannedResult(decodedText);
        setIsScanning(false);
        
        // Visual feedback delay before actual navigation
        setTimeout(() => {
          onScan(decodedText);
          if (scanner) scanner.clear();
        }, 1000);
      }, (err) => {
        // Quietly handle scan errors (no QR found in frame)
      });
    } catch (e: any) {
      console.error("Scanner initialization failed", e);
      setError(e.message || "Failed to start camera. Please ensure camera permissions are granted.");
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.warn("Scanner cleanup failed", e));
      }
    };
  }, [onScan]);

  const [manualCode, setManualCode] = useState("");

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Machine Scanner</h1>
        <p className="text-slate-500 text-sm">Scan the QR code on any machine to view its full service history and status.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <div className="space-y-2">
            <p className="font-bold">Camera Access Error</p>
            <p>{error}</p>
            <p className="text-xs opacity-80">Check your browser settings to allow camera access for this site.</p>
          </div>
        </div>
      )}

      <div className="relative group">
        {/* Scanner Container */}
        <div 
          id="reader" 
          className={cn(
            "overflow-hidden rounded-3xl border-4 transition-all duration-500 shadow-2xl bg-black aspect-square",
            scannedResult ? "border-emerald-500 scale-[1.02]" : "border-white/10",
            error ? "opacity-50 grayscale" : ""
          )}
        ></div>

        {/* Scanning Overlay */}
        {isScanning && !scannedResult && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-indigo-500/50 rounded-2xl relative overflow-hidden">
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
              />
              <div className="absolute inset-0 bg-indigo-500/5" />
            </div>
            <div className="mt-8 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium uppercase tracking-widest">Searching for QR...</span>
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {scannedResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-3xl pointer-events-none"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <Check className="text-white" size={40} />
            </div>
            <p className="mt-4 text-emerald-700 font-bold text-lg">Machine Identified!</p>
            <p className="text-emerald-600 text-sm font-medium">Redirecting to details...</p>
          </motion.div>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Or enter code manually</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter QR Code ID..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && manualCode && onScan(manualCode)}
          />
          <button 
            onClick={() => manualCode && onScan(manualCode)}
            disabled={!manualCode}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
          >
            Go
          </button>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-slate-50 border-none shadow-none p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Info size={16} className="text-indigo-600" />
          Scanning Tips
        </h3>
        <ul className="space-y-3">
          {[
            "Ensure the machine is in a well-lit area.",
            "Hold your phone steady about 6-10 inches away.",
            "Make sure the entire QR code is within the frame.",
            "Clean your camera lens if the image is blurry."
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-rose-100">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
};

const MaintenanceList = ({ 
  maintenance, 
  machines, 
  technicians,
  onRefresh,
  onEdit,
  onDelete
}: { 
  maintenance: Maintenance[]; 
  machines: Machine[];
  technicians: User[];
  onRefresh: () => void;
  onEdit: (m: Maintenance) => void;
  onDelete: (m: Maintenance) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Maintenance | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<Maintenance | null>(null);
  const [showActionModal, setShowActionModal] = useState<Maintenance | null>(null);
  const [completionDescription, setCompletionDescription] = useState('');
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [newTechData, setNewTechData] = useState({ name: '', email: '', password: '' });
  const [formData, setFormData] = useState({
    machine_id: '',
    type: 'Preventive',
    technician_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    checklist: '',
    status: 'pending',
    description: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        machine_id: editingTask.machine_id.toString(),
        type: editingTask.type,
        technician_id: editingTask.technician_id?.toString() || '',
        date: editingTask.date,
        checklist: editingTask.checklist,
        status: editingTask.status,
        description: editingTask.description || ''
      });
      setShowForm(true);
    } else {
      setFormData({
        machine_id: '',
        type: 'Preventive',
        technician_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checklist: '',
        status: 'pending',
        description: ''
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'completed' && !formData.description) {
      alert('Please provide a description of the work performed for completed tasks.');
      return;
    }
    try {
      const url = editingTask ? `/api/maintenance/${editingTask.id}` : '/api/maintenance';
      const method = editingTask ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setEditingTask(null);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  };

  const handleAccept = async (id: number, technicianId: number) => {
    try {
      const res = await fetch(`/api/maintenance/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician_id: technicianId })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error('Error accepting maintenance:', error);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteModal) return;
    try {
      // Prepend technician name and machine number as requested by user
      const fullDescription = `Technician: ${showCompleteModal.technician_name} | Machine: ${showCompleteModal.machine_no} | Action: ${completionDescription}`;
      const res = await fetch(`/api/maintenance/${showCompleteModal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: fullDescription })
      });
      if (res.ok) {
        setShowCompleteModal(null);
        setCompletionDescription('');
        onRefresh();
      }
    } catch (error) {
      console.error('Error completing maintenance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Maintenance Schedule</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={18} />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {showForm && (
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold mb-4">{editingTask ? 'Edit Maintenance Task' : 'New Maintenance Task'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Machine</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.machine_id}
                  onChange={e => setFormData({...formData, machine_id: e.target.value})}
                >
                  <option value="">Select Machine</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.qr_code} - {m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Predictive">Predictive</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Technician</label>
                  <button 
                    type="button"
                    onClick={() => setIsAddingTech(!isAddingTech)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {isAddingTech ? <X size={10} /> : <Plus size={10} />}
                    {isAddingTech ? 'Cancel' : 'Quick Add'}
                  </button>
                </div>
                {isAddingTech ? (
                  <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <input 
                      type="text"
                      placeholder="Name"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                      value={newTechData.name}
                      onChange={e => setNewTechData({...newTechData, name: e.target.value})}
                    />
                    <input 
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                      value={newTechData.email}
                      onChange={e => setNewTechData({...newTechData, email: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!newTechData.name || !newTechData.email) return;
                        try {
                          const res = await fetch('/api/technicians', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newTechData)
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setIsAddingTech(false);
                            setNewTechData({ name: '', email: '', password: '' });
                            onRefresh();
                            // We can't easily auto-select because onRefresh is async and techs prop will update later
                            // But the user can now see the new tech in the list
                          }
                        } catch (err) {
                          console.error('Failed to add tech:', err);
                        }
                      }}
                      className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Add Technician
                    </button>
                  </div>
                ) : (
                  <select 
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.technician_id}
                    onChange={e => setFormData({...formData, technician_id: e.target.value})}
                  >
                    <option value="">Assign Technician</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Schedule Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Checklist / Notes</label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20"
                placeholder="Enter maintenance steps..."
                value={formData.checklist}
                onChange={e => setFormData({...formData, checklist: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Work Performed / Details</label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24"
                placeholder="Describe work performed (if completed)..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">{editingTask ? 'Update Task' : 'Schedule'}</button>
            </div>
          </form>
        </Card>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Complete Service</h2>
                <button type="button" onClick={() => setShowCompleteModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Machine</p>
                <p className="text-sm font-bold text-indigo-900">{showCompleteModal.machine_name} ({showCompleteModal.machine_no})</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Service Description</label>
                <textarea 
                  required
                  autoFocus
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-32 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Describe what was done during the service..."
                  value={completionDescription}
                  onChange={e => setCompletionDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCompleteModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200">Submit & Complete</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} />
                  <span>Technician Action Report</span>
                </h2>
                <button onClick={() => setShowActionModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Machine</p>
                  <p className="text-sm font-bold text-slate-800">{showActionModal.machine_name} ({showActionModal.machine_no})</p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Action Taken</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{showActionModal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Technician</p>
                    <p className="text-xs font-medium text-slate-700">{showActionModal.technician_name}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Completed At</p>
                    <p className="text-xs font-medium text-slate-700">
                      {showActionModal.completed_at ? format(new Date(showActionModal.completed_at), 'MMM d, HH:mm') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowActionModal(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm mt-2"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Machine</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Technician</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenance.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{m.machine_name}</div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{m.machine_no}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{m.type}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{m.technician_name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(m.date), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      m.status === 'completed' ? 'success' : 
                      m.status === 'accepted' ? 'info' : 'warning'
                    }>
                      {m.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {m.status === 'pending' && (
                        <button 
                          onClick={() => handleAccept(m.id, m.technician_id)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      {m.status === 'accepted' && (
                        <button 
                          onClick={() => setShowCompleteModal(m)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {m.status === 'completed' && m.description && (
                        <button 
                          onClick={() => setShowActionModal(m)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors"
                        >
                          <FileText size={14} />
                          <span>View Action</span>
                        </button>
                      )}
                      <div className="flex items-center gap-1 ml-2 border-l border-slate-100 pl-2">
                        <button 
                          onClick={() => setEditingTask(m)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(m);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BreakdownList = ({ 
  breakdowns, 
  machines, 
  onRefresh 
}: { 
  breakdowns: Breakdown[]; 
  machines: Machine[];
  onRefresh: () => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    machine_id: '',
    issue: '',
    priority: 'medium',
    reported_by_id: 1 // Default to admin for demo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/breakdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Error reporting breakdown:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Breakdown Reports</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm text-sm font-medium"
        >
          <AlertCircle size={18} />
          <span>Report Breakdown</span>
        </button>
      </div>

      {showForm && (
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold mb-4 text-rose-600">Report Machine Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Machine</label>
                <select 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.machine_id}
                  onChange={e => setFormData({...formData, machine_id: e.target.value})}
                >
                  <option value="">Select Machine</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.qr_code} - {m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Issue Description</label>
              <textarea 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24"
                placeholder="Describe the problem..."
                value={formData.issue}
                onChange={e => setFormData({...formData, issue: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold">Submit Report</button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Machine</th>
                <th className="px-6 py-4 font-semibold">Issue</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Reported By</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdowns.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{b.machine_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.machine_no}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[150px] truncate">{b.issue}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      b.priority === 'critical' || b.priority === 'high' ? 'danger' : 
                      b.priority === 'medium' ? 'warning' : 'info'
                    }>
                      {b.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{b.reported_by_name}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">
                    {format(new Date(b.reported_at), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        b.status === 'reported' ? 'bg-rose-500 animate-pulse' : 
                        b.status === 'in_progress' ? 'bg-amber-500' : 'bg-emerald-500'
                      )} />
                      <span className="text-xs font-medium capitalize">{b.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SpareParts = ({ 
  parts, 
  usage, 
  machines, 
  technicians, 
  onRefresh,
  onEdit,
  onDelete
}: { 
  parts: SparePart[]; 
  usage: SparePartUsage[];
  machines: Machine[];
  technicians: User[];
  onRefresh: () => void;
  onEdit: (p: SparePart) => void;
  onDelete: (p: SparePart) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [showIssueForm, setShowIssueForm] = useState<SparePart | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState<SparePart | null>(null);
  const [quickAddAmount, setQuickAddAmount] = useState('1');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usageSearchQuery, setUsageSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    stock: '',
    min_stock: '',
    unit: 'pcs',
    needle_size: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPart) {
      setFormData({
        name: editingPart.name,
        code: editingPart.code,
        stock: editingPart.stock.toString(),
        min_stock: editingPart.min_stock.toString(),
        unit: editingPart.unit,
        needle_size: editingPart.needle_size || ''
      });
      setShowForm(true);
    } else {
      setFormData({ name: '', code: '', stock: '', min_stock: '', unit: 'pcs', needle_size: '' });
    }
  }, [editingPart]);

  const [issueData, setIssueData] = useState({
    machine_id: '',
    quantity: '1',
    technician_id: ''
  });
  const [machineSearch, setMachineSearch] = useState('');
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [newTechData, setNewTechData] = useState({ name: '', email: '', password: '' });

  const categories = ['All', 'Mechanical', 'Electrical', 'Consumables', 'Tools'];

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = filterLowStock ? p.stock <= p.min_stock : true;
    return matchesSearch && matchesLowStock;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const url = editingPart ? `/api/spare-parts/${editingPart.id}` : '/api/spare-parts';
      const method = editingPart ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stock: parseInt(formData.stock),
          min_stock: parseInt(formData.min_stock)
        })
      });
      if (res.ok) {
        if (!editingPart) {
          const data = await res.json();
          if (data.updated) {
            alert(`Part with code ${formData.code} already exists. Updated stock. New Total: ${data.newStock} ${formData.unit || 'pcs'}`);
          }
        }
        setShowForm(false);
        setEditingPart(null);
        onRefresh();
        setFormData({ name: '', code: '', stock: '', min_stock: '', unit: 'pcs', needle_size: '' });
      } else {
        const data = await res.json();
        let errorMsg = data.error || 'Failed to save spare part';
        if (data.details) errorMsg += `: ${data.details}`;
        if (data.hint) errorMsg += ` (${data.hint})`;
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error saving spare part:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showIssueForm) return;
    try {
      const res = await fetch('/api/spare-parts/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_id: showIssueForm.id,
          machine_id: parseInt(issueData.machine_id),
          quantity: parseInt(issueData.quantity),
          technician_id: parseInt(issueData.technician_id)
        })
      });
      if (res.ok) {
        setShowIssueForm(null);
        onRefresh();
        setIssueData({ machine_id: '', quantity: '1', technician_id: '' });
      }
    } catch (error) {
      console.error('Error issuing part:', error);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuickAdd) return;
    try {
      const res = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: showQuickAdd.name,
          code: showQuickAdd.code,
          stock: parseInt(quickAddAmount),
          min_stock: showQuickAdd.min_stock,
          unit: showQuickAdd.unit
        })
      });
      if (res.ok) {
        setShowQuickAdd(null);
        setQuickAddAmount('1');
        onRefresh();
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const filteredUsage = usage.filter(u => 
    u.part_name?.toLowerCase().includes(usageSearchQuery.toLowerCase()) ||
    u.part_code?.toLowerCase().includes(usageSearchQuery.toLowerCase()) ||
    u.machine_no?.toLowerCase().includes(usageSearchQuery.toLowerCase()) ||
    u.machine_name?.toLowerCase().includes(usageSearchQuery.toLowerCase())
  );

  const downloadUsagePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Spare Parts Usage History', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    const totalQtyUsed = filteredUsage.reduce((sum, u) => sum + u.quantity, 0);
    doc.text(`Total Records: ${filteredUsage.length} | Total Quantity Used: ${totalQtyUsed}`, 14, 40);
    
    const tableData = filteredUsage.map(u => [
      format(new Date(u.date), 'MMM d, yyyy HH:mm'),
      u.part_name || 'N/A',
      u.part_code || 'N/A',
      `${u.quantity} ${u.unit || 'pcs'}`,
      u.machine_no || 'N/A',
      u.machine_name || 'N/A',
      u.technician_name || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Part Name', 'Code', 'Qty', 'Machine No', 'Machine Name', 'Technician']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 },
      styles: { fontSize: 9 }
    });
    
    doc.save('spare-parts-usage-history.pdf');
  };

  const downloadPartSummaryPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Spare Parts Usage Summary', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 30);
    
    // Group usage by part
    const partSummary: Record<string, { 
      name: string, 
      code: string, 
      totalQty: number, 
      machines: Set<string>,
      unit: string 
    }> = {};

    filteredUsage.forEach(u => {
      const key = u.part_id.toString();
      if (!partSummary[key]) {
        partSummary[key] = {
          name: u.part_name || 'N/A',
          code: u.part_code || 'N/A',
          totalQty: 0,
          machines: new Set(),
          unit: u.unit || 'pcs'
        };
      }
      partSummary[key].totalQty += u.quantity;
      if (u.machine_no) partSummary[key].machines.add(`${u.machine_no} - ${u.machine_name}`);
    });

    const tableData = Object.values(partSummary).map(p => [
      p.name,
      p.code,
      `${p.totalQty} ${p.unit}`,
      p.machines.size.toString(),
      Array.from(p.machines).join(', ')
    ]);

    const grandTotalQty = Object.values(partSummary).reduce((sum, p) => sum + p.totalQty, 0);

    autoTable(doc, {
      startY: 40,
      head: [['Part Name', 'Code', 'Total Qty Used', 'Machines Count', 'Machines List']],
      body: tableData,
      foot: [['Grand Total', '', grandTotalQty.toString(), '', '']],
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 80 } // Give more space to machines list
      }
    });

    doc.save('spare-parts-usage-summary.pdf');
  };

  const downloadFilteredStockPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(20, 30, 70);
    doc.text('Spare Parts Stock Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Filter Info
    let filterText = 'Filters: None';
    if (searchQuery || filterLowStock) {
      const filters = [];
      if (searchQuery) filters.push(`Search: "${searchQuery}"`);
      if (filterLowStock) filters.push('Low Stock Only');
      filterText = `Filters: ${filters.join(', ')}`;
    }
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(filterText, 14, 36);
    
    // Inventory Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Current Inventory Status', 14, 46);
    
    const totalStock = filteredParts.reduce((sum, p) => sum + p.stock, 0);

    autoTable(doc, {
      startY: 50,
      head: [['Part Name', 'Code', 'Size', 'Stock', 'Min Stock', 'Unit', 'Status']],
      body: filteredParts.map(p => [
        p.name,
        p.code,
        p.needle_size || '-',
        p.stock.toString(),
        p.min_stock.toString(),
        p.unit,
        p.stock <= p.min_stock ? 'LOW STOCK' : 'OK'
      ]),
      foot: [['Total', '', '', totalStock.toString(), '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6 && data.cell.text[0] === 'LOW STOCK') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save(`spare_parts_stock_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const existingPartMatch = formData.code ? parts.find(p => p.code.toLowerCase() === formData.code.toLowerCase()) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 text-sm">Track spare parts, stock levels, and usage history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium whitespace-nowrap",
              filterLowStock 
                ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <AlertTriangle size={16} />
            <span>Low Stock</span>
          </button>
          <button 
            onClick={downloadFilteredStockPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
          >
            <FileText size={18} className="text-indigo-600" />
            <span>Download PDF</span>
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {showForm && (
        <Card className="max-w-2xl mx-auto border-2 border-indigo-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold mb-4">{editingPart ? 'Edit Spare Part' : 'Add New Inventory Item'}</h2>
            
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 mb-4">
                <AlertCircle size={18} />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            {!editingPart && existingPartMatch && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <div className="text-xs text-amber-800">
                  <p className="font-bold">Part already exists!</p>
                  <p>Entering stock will add to the current balance of <strong>{existingPartMatch.stock} {existingPartMatch.unit}</strong>.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Needle DBx1"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Item Code</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. P-101"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Initial Stock</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Min Stock Alert</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.min_stock}
                  onChange={e => setFormData({...formData, min_stock: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="set">Set</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilogram (kg)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Needle Size</label>
                <input 
                  type="text" 
                  placeholder="e.g. 14, 16, 18..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.needle_size}
                  onChange={e => setFormData({...formData, needle_size: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingPart(null); }} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">{editingPart ? 'Update Part' : 'Add Item'}</button>
            </div>
          </form>
        </Card>
      )}

      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Add Stock: {showQuickAdd.name}</h2>
                <button type="button" onClick={() => setShowQuickAdd(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Current Stock:</span>
                    <span className="font-bold text-indigo-600">{showQuickAdd.stock} {showQuickAdd.unit}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Quantity to Add</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={quickAddAmount}
                    onChange={e => setQuickAddAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowQuickAdd(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Update Stock</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showIssueForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <form onSubmit={handleIssue} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Issue {showIssueForm.name}</h2>
                <button type="button" onClick={() => setShowIssueForm(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Machine (Search by No. or Name)</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text"
                      placeholder="Type machine number or name..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                      value={machineSearch}
                      onChange={e => setMachineSearch(e.target.value)}
                    />
                  </div>
                  <select 
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={issueData.machine_id}
                    onChange={e => setIssueData({...issueData, machine_id: e.target.value})}
                  >
                    <option value="">Select Machine</option>
                    {machines
                      .filter(m => 
                        m.name.toLowerCase().includes(machineSearch.toLowerCase()) || 
                        m.qr_code.toLowerCase().includes(machineSearch.toLowerCase())
                      )
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.qr_code} - {m.name}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Quantity ({showIssueForm.unit})</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      max={showIssueForm.stock}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      value={issueData.quantity}
                      onChange={e => setIssueData({...issueData, quantity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase">Technician</label>
                      <button 
                        type="button"
                        onClick={() => setIsAddingTech(!isAddingTech)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {isAddingTech ? <X size={10} /> : <Plus size={10} />}
                        {isAddingTech ? 'Cancel' : 'Quick Add'}
                      </button>
                    </div>
                    {isAddingTech ? (
                      <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <input 
                          type="text"
                          placeholder="Name"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                          value={newTechData.name}
                          onChange={e => setNewTechData({...newTechData, name: e.target.value})}
                        />
                        <input 
                          type="email"
                          placeholder="Email"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                          value={newTechData.email}
                          onChange={e => setNewTechData({...newTechData, email: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={async () => {
                            if (!newTechData.name || !newTechData.email) return;
                            try {
                              const res = await fetch('/api/technicians', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newTechData)
                              });
                              if (res.ok) {
                                setIsAddingTech(false);
                                setNewTechData({ name: '', email: '', password: '' });
                                onRefresh();
                              }
                            } catch (err) {
                              console.error('Failed to add tech:', err);
                            }
                          }}
                          className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Add Technician
                        </button>
                      </div>
                    ) : (
                      <select 
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={issueData.technician_id}
                        onChange={e => setIssueData({...issueData, technician_id: e.target.value})}
                      >
                        <option value="">Select Tech</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowIssueForm(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Confirm Issue</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredParts.length > 0 ? filteredParts.map((part) => (
          <Card key={part.id} className={cn(
            "relative overflow-hidden flex flex-col",
            part.stock <= part.min_stock && "border-rose-200 bg-rose-50/30"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Package className="text-slate-500" size={20} />
              </div>
              <div className="flex items-center gap-1">
                {part.stock <= part.min_stock && (
                  <Badge variant="danger">Low Stock</Badge>
                )}
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    onClick={() => setEditingPart(part)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(part);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              {part.name}
              {part.stock <= part.min_stock && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Code: {part.code}
              {part.needle_size && <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold ring-1 ring-indigo-100">Size: {part.needle_size}</span>}
            </p>
            
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">{part.stock}</p>
                <p className="text-xs text-slate-500">Available {part.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Min: {part.min_stock}</p>
              </div>
            </div>
            
            <div className="mt-auto space-y-2">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    part.stock <= part.min_stock ? "bg-rose-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min((part.stock / (part.min_stock * 2)) * 100, 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowIssueForm(part)}
                  disabled={part.stock === 0}
                  className="py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Issue
                </button>
                <button 
                  onClick={() => {
                    setShowQuickAdd(part);
                    setQuickAddAmount('1');
                  }}
                  className="py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  Add Stock
                </button>
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Package className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 italic">No items found matching your filter.</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Usage History
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Filter usage history..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
                value={usageSearchQuery}
                onChange={e => setUsageSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={downloadPartSummaryPDF}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors shadow-sm text-sm font-medium"
            >
              <FileText size={18} className="text-amber-600" />
              <span>Summary Report</span>
            </button>
            <button 
              onClick={downloadUsagePDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
            >
              <FileText size={18} className="text-indigo-600" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Part</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Machine No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Machine Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Qty</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsage.length > 0 ? filteredUsage.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(u.date), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{u.part_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold">{u.machine_no}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{u.machine_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-indigo-600">-{u.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {u.technician_name}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      No usage records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TechnicianList = ({ technicians, onRefresh }: { technicians: User[]; onRefresh: () => void }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', email: '', password: '' });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add technician');
      }
    } catch (error) {
      console.error('Error adding technician:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Technician Team</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Technician</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <Card className="w-full max-w-md p-6 relative">
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Technician</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="tech@factory.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Technician'}
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map((tech) => (
          <Card key={tech.id} className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
              {tech.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{tech.name}</h3>
              <p className="text-sm text-slate-500">{tech.email}</p>
              <div className="mt-2">
                <Badge variant="info">Technician</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Reports = ({ 
  stats, 
  maintenance, 
  parts, 
  partUsage 
}: { 
  stats: Stats | null;
  maintenance: Maintenance[];
  parts: SparePart[];
  partUsage: SparePartUsage[];
}) => {
  const data = [
    { name: 'Running', value: stats?.runningMachines || 0 },
    { name: 'Repair', value: stats?.repairMachines || 0 },
    { name: 'Maint. Due', value: stats?.maintenanceDue || 0 },
  ];

  const downloadMaintenanceReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(20, 30, 70);
    doc.text('Factory Maintenance History Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Machines', stats?.totalMachines?.toString() || '0'],
        ['Running Machines', stats?.runningMachines?.toString() || '0'],
        ['Machines Under Repair', stats?.repairMachines?.toString() || '0'],
        ['Maintenance Due', stats?.maintenanceDue?.toString() || '0'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Detailed Maintenance Table
    doc.text('Detailed Maintenance Activities', 14, (doc as any).lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Machine', 'Type', 'Technician', 'Status', 'Description']],
      body: maintenance.map(m => [
        format(new Date(m.date), 'yyyy-MM-dd'),
        `${m.machine_name} (${m.machine_no})`,
        m.type,
        m.technician_name || 'Unassigned',
        m.status.toUpperCase(),
        m.description || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      columnStyles: {
        5: { cellWidth: 60 } // Give more space to description
      }
    });

    doc.save('maintenance_report.pdf');
  };

  const downloadSparePartsReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(20, 30, 70);
    doc.text('Spare Parts Inventory & Usage Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Inventory Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Current Inventory Status', 14, 40);
    
    const totalStock = parts.reduce((sum, p) => sum + p.stock, 0);

    autoTable(doc, {
      startY: 45,
      head: [['Part Name', 'Code', 'Size', 'Stock', 'Min Stock', 'Unit', 'Status']],
      body: parts.map(p => [
        p.name,
        p.code,
        p.needle_size || '-',
        p.stock.toString(),
        p.min_stock.toString(),
        p.unit,
        p.stock <= p.min_stock ? 'LOW STOCK' : 'OK'
      ]),
      foot: [['Total', '', '', totalStock.toString(), '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
      footStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5 && data.cell.text[0] === 'LOW STOCK') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Usage Table
    doc.addPage();
    doc.text('Spare Part Usage History', 14, 20);
    
    const totalUsage = partUsage.reduce((sum, u) => sum + u.quantity, 0);

    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Machine No', 'Machine Name', 'Part', 'Qty', 'Technician']],
      body: partUsage.map(u => [
        format(new Date(u.date), 'yyyy-MM-dd'),
        u.machine_no || '-',
        u.machine_name || 'Unknown',
        u.part_name || 'Unknown',
        u.quantity.toString(),
        u.technician_name || 'Unknown'
      ]),
      foot: [['Total Usage', '', '', '', totalUsage.toString(), '']],
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] },
      footStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold' },
      styles: { fontSize: 8 },
    });

    doc.save('spare_parts_report.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Maintenance Analytics</h1>
        <div className="flex gap-3">
          <button 
            onClick={downloadMaintenanceReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
          >
            <BarChart3 size={18} />
            <span>Maintenance PDF</span>
          </button>
          <button 
            onClick={downloadSparePartsReport}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-semibold shadow-lg shadow-amber-200"
          >
            <Package size={18} />
            <span>Spare Parts PDF</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold mb-6">Machine Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#f43f5e" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold mb-6">Key Performance Indicators</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Machine Availability</span>
              <span className="font-bold text-emerald-600">94.2%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Mean Time To Repair (MTTR)</span>
              <span className="font-bold text-amber-600">2.4 hrs</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Preventive Compliance</span>
              <span className="font-bold text-indigo-600">88%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


const AddMachine = ({ machine, onCancel, onSuccess }: { machine?: Machine | null; onCancel: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: machine?.name || '',
    type: machine?.type || '',
    customType: '',
    model: machine?.model || '',
    serial_number: machine?.serial_number || '',
    line: machine?.line || 'N/A',
    location: machine?.location || 'N/A',
    qr_code: machine?.qr_code || '',
    purchase_date: machine?.purchase_date || format(new Date(), 'yyyy-MM-dd'),
    status: machine?.status || 'running'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const finalType = formData.type === 'Other' ? formData.customType : formData.type;
    try {
      const url = machine ? `/api/machines/${machine.id}` : '/api/machines';
      const method = machine ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: finalType
        })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        let errorMsg = data.error || 'Failed to save machine';
        if (data.details) errorMsg += `: ${data.details}`;
        if (data.hint) errorMsg += ` (${data.hint})`;
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error saving machine:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{machine ? 'Edit Machine' : 'Add New Machine'}</h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Machine Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Juki DDL-8700"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Machine Type</label>
              <div className="space-y-3">
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">Select Type</option>
                  <option value="Sewing Machine">Sewing Machine</option>
                  <option value="Overlock Machine">Overlock Machine</option>
                  <option value="Cutting Machine">Cutting Machine</option>
                  <option value="Finishing Machine">Finishing Machine</option>
                  <option value="Multi-needle">Multi-needle</option>
                  <option value="Other">Other (Custom Type)</option>
                </select>
                
                {formData.type === 'Other' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <input 
                      required
                      type="text" 
                      placeholder="Enter custom machine type"
                      className="w-full px-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={formData.customType}
                      onChange={e => setFormData({...formData, customType: e.target.value})}
                    />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Model Number</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Serial Number</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={formData.serial_number}
                onChange={e => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">QR Code ID</label>
              <input 
                required
                type="text" 
                placeholder="e.g. MCH-005"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={formData.qr_code}
                onChange={e => setFormData({...formData, qr_code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Purchase Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={formData.purchase_date}
                onChange={e => setFormData({...formData, purchase_date: e.target.value})}
              />
            </div>
            {machine && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="running">Running</option>
                  <option value="under_repair">Under Repair</option>
                  <option value="maintenance_due">Maintenance Due</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (machine ? 'Update Machine' : 'Add Machine')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const MachineDetail = ({ machine, onBack, onReportBreakdown, onScheduleMaintenance }: { 
  machine: Machine; 
  onBack: () => void;
  onReportBreakdown: (machine: Machine) => void;
  onScheduleMaintenance: (machine: Machine) => void;
}) => {
  const [history, setHistory] = useState<{ maintenance: Maintenance[]; breakdowns: Breakdown[]; usage: SparePartUsage[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'maintenance' | 'breakdowns' | 'parts'>('maintenance');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, usageRes] = await Promise.all([
          fetch(`/api/machines/${machine.id}/history`),
          fetch(`/api/spare-parts/usage`)
        ]);
        const historyData = await historyRes.json();
        const allUsage = await usageRes.json();
        const machineUsage = allUsage.filter((u: SparePartUsage) => u.machine_id === machine.id);
        
        setHistory({ ...historyData, usage: machineUsage });
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [machine.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Machine Profile</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onReportBreakdown(machine)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors text-sm font-medium"
          >
            <AlertTriangle size={16} />
            <span>Report Issue</span>
          </button>
          <button 
            onClick={() => onScheduleMaintenance(machine)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Wrench size={16} />
            <span>Maintenance</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Factory size={48} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{machine.name}</h2>
              <p className="text-sm text-slate-500">{machine.type}</p>
              <div className="mt-4">
                <Badge variant={
                  machine.status === 'running' ? 'success' : 
                  machine.status === 'under_repair' ? 'danger' : 'warning'
                }>
                  {machine.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Machine ID</span>
                <span className="font-mono font-medium text-slate-900">{machine.qr_code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Model</span>
                <span className="font-medium text-slate-900">{machine.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Serial No</span>
                <span className="font-medium text-slate-900">{machine.serial_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-900">{machine.line} - {machine.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pt-6 border-t border-slate-50">
              <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                <QRCodeCanvas value={machine.qr_code} size={120} />
              </div>
              <p className="text-xs font-mono text-slate-400">{machine.qr_code}</p>
            </div>
          </Card>

          <Card className="sm:hidden space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => onReportBreakdown(machine)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-sm"
              >
                <AlertTriangle size={18} />
                Report Breakdown
              </button>
              <button 
                onClick={() => onScheduleMaintenance(machine)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm"
              >
                <Wrench size={18} />
                Schedule Maintenance
              </button>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              Service & Maintenance History
            </h3>
          </div>
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveSubTab('maintenance')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors border-b-2",
                activeSubTab === 'maintenance' ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Maintenance
            </button>
            <button 
              onClick={() => setActiveSubTab('breakdowns')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors border-b-2",
                activeSubTab === 'breakdowns' ? "border-rose-600 text-rose-600 bg-rose-50/30" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Breakdowns
            </button>
            <button 
              onClick={() => setActiveSubTab('parts')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors border-b-2",
                activeSubTab === 'parts' ? "border-amber-600 text-amber-600 bg-amber-50/30" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Parts Used
            </button>
          </div>

          <div className="p-6 flex-1">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubTab === 'maintenance' && (
                  history?.maintenance.length ? (
                    history.maintenance.map((m) => (
                      <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{m.type}</p>
                          <p className="text-xs text-slate-500">Technician: {m.technician_name}</p>
                          {m.description && (
                            <p className="text-xs text-indigo-600 font-medium mt-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 italic">
                              {m.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">{m.checklist}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{format(new Date(m.date), 'MMM d, yyyy')}</p>
                          <Badge variant="success">Completed</Badge>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-center py-8 text-slate-400 italic">No maintenance history.</p>
                )}

                {activeSubTab === 'breakdowns' && (
                  history?.breakdowns.length ? (
                    history.breakdowns.map((b) => (
                      <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{b.issue}</p>
                          <p className="text-xs text-slate-500">Reported by: {b.reported_by_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{format(new Date(b.reported_at), 'MMM d, yyyy')}</p>
                          <Badge variant={b.status === 'resolved' ? 'success' : 'danger'}>{b.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-center py-8 text-slate-400 italic">No breakdown history.</p>
                )}

                {activeSubTab === 'parts' && (
                  history?.usage.length ? (
                    history.usage.map((u) => (
                      <div key={u.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{u.part_name}</p>
                          <p className="text-[10px] font-mono text-slate-500">Code: {u.part_code}</p>
                          <p className="text-xs text-slate-500 mt-1">Technician: {u.technician_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{format(new Date(u.date), 'MMM d, yyyy')}</p>
                          <p className="text-sm font-bold text-indigo-600">Qty: {u.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-center py-8 text-slate-400 italic">No parts usage history.</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prevTab, setPrevTab] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [partUsage, setPartUsage] = useState<SparePartUsage[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const fetchData = async (retries = 5) => {
    try {
      const [statsRes, machinesRes, breakdownsRes, partsRes, usageRes, maintenanceRes, techsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/machines'),
        fetch('/api/breakdowns'),
        fetch('/api/spare-parts'),
        fetch('/api/spare-parts/usage'),
        fetch('/api/maintenance'),
        fetch('/api/technicians')
      ]);
      
      if (!statsRes.ok || !machinesRes.ok || !breakdownsRes.ok || !partsRes.ok || !usageRes.ok || !maintenanceRes.ok || !techsRes.ok) {
        throw new Error('One or more requests failed');
      }

      setStats(await statsRes.json());
      setMachines(await machinesRes.json());
      setBreakdowns(await breakdownsRes.json());
      setParts(await partsRes.json());
      setPartUsage(await usageRes.json());
      setMaintenance(await maintenanceRes.json());
      setTechnicians(await techsRes.json());
      setLoading(false);
    } catch (error) {
      if (retries > 0) {
        setTimeout(() => fetchData(retries - 1), 3000);
      } else {
        console.error('Error fetching data after multiple attempts:', error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigate = (tab: string) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const handleScan = (qrCode: string) => {
    const machine = machines.find(m => m.qr_code === qrCode);
    if (machine) {
      setSelectedMachine(machine);
      handleNavigate('machine-detail');
    } else {
      alert(`Machine with QR ${qrCode} not found in inventory.`);
    }
  };

  const handleDeleteMachine = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this machine? This will also delete all its maintenance and breakdown history.')) return;
    try {
      const res = await fetch(`/api/machines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to delete machine: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('An unexpected error occurred while deleting the machine.');
    }
  };

  const handleDeleteMaintenance = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to delete maintenance record: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      alert('An unexpected error occurred while deleting the maintenance record.');
    }
  };

  const handleDeletePart = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) return;
    try {
      const res = await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to delete spare part: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting spare part:', error);
      alert('An unexpected error occurred while deleting the spare part.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: Factory },
    { id: 'scan', label: 'Scan QR', icon: QrCode },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'breakdown', label: 'Breakdowns', icon: AlertTriangle },
    { id: 'spare-parts', label: 'Spare Parts', icon: Package },
    { id: 'technicians', label: 'Technicians', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing Factory Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col lg:flex-row">
      {/* Sidebar - Desktop only */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-slate-200 hidden lg:flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Wrench size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-slate-800">MaintPro</span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={22} className={cn(
                activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              {item.id === 'spare-parts' && (stats?.lowStock ?? 0) > 0 && isSidebarOpen && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.lowStock}
                </span>
              )}
              {activeTab === item.id && isSidebarOpen && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hidden lg:block"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Wrench size={18} />
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-1 sm:mx-2" />
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
              <span className="hidden sm:inline">Factory Floor</span>
              <ChevronRight size={12} className="hidden sm:inline" />
              <span className="font-bold text-slate-900 capitalize truncate max-w-[100px] sm:max-w-none">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationCenter />
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">John Manager</p>
                <p className="text-[10px] text-slate-500">Lead</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/manager/100/100" 
                  alt="User" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  onAddMachine={() => handleNavigate('add-machine')} 
                  onScanClick={() => handleNavigate('scan')}
                />
              )}
              {activeTab === 'machines' && (
                <MachineList 
                  machines={machines} 
                  onMachineClick={(m) => {
                    setSelectedMachine(m);
                    handleNavigate('machine-detail');
                  }} 
                  onEdit={(m) => {
                    setEditingMachine(m);
                    handleNavigate('add-machine');
                  }}
                  onDelete={(m) => handleDeleteMachine(m.id)}
                  onScanClick={() => handleNavigate('scan')}
                />
              )}
              {activeTab === 'machine-detail' && selectedMachine && (
                <MachineDetail 
                  machine={selectedMachine} 
                  onBack={() => setActiveTab(prevTab === 'scan' ? 'machines' : prevTab)} 
                  onReportBreakdown={(m) => {
                    // Logic to open breakdown form for this machine
                    setActiveTab('breakdown');
                  }}
                  onScheduleMaintenance={(m) => {
                    // Logic to open maintenance form for this machine
                    setEditingMaintenance(null);
                    setActiveTab('maintenance');
                  }}
                />
              )}
              {activeTab === 'scan' && <Scanner onScan={handleScan} />}
              {activeTab === 'maintenance' && (
                <MaintenanceList 
                  maintenance={maintenance} 
                  machines={machines} 
                  technicians={technicians}
                  onRefresh={fetchData}
                  onEdit={(m) => setEditingMaintenance(m)}
                  onDelete={(m) => handleDeleteMaintenance(m.id)}
                />
              )}
              {activeTab === 'breakdown' && (
                <BreakdownList 
                  breakdowns={breakdowns} 
                  machines={machines} 
                  onRefresh={fetchData}
                />
              )}
              {activeTab === 'spare-parts' && (
                <SpareParts 
                  parts={parts} 
                  usage={partUsage}
                  machines={machines}
                  technicians={technicians}
                  onRefresh={fetchData}
                  onEdit={(p) => setEditingPart(p)}
                  onDelete={(p) => handleDeletePart(p.id)}
                />
              )}
              {activeTab === 'technicians' && <TechnicianManagement machines={machines} onRefresh={fetchData} />}
              {activeTab === 'reports' && (
                <Reports 
                  stats={stats} 
                  maintenance={maintenance}
                  parts={parts}
                  partUsage={partUsage}
                />
              )}
              {activeTab === 'add-machine' && (
                <AddMachine 
                  machine={editingMachine}
                  onCancel={() => {
                    setEditingMachine(null);
                    setActiveTab('machines');
                  }} 
                  onSuccess={() => {
                    setEditingMachine(null);
                    setActiveTab('machines');
                    fetchData();
                  }} 
                />
              )}
              
              {/* Fallback for unimplemented tabs */}
              {!['dashboard', 'machines', 'scan', 'maintenance', 'breakdown', 'spare-parts', 'technicians', 'reports', 'add-machine', 'machine-detail'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                  <Wrench size={48} className="mb-4 opacity-20" />
                  <h2 className="text-lg font-semibold">Under Development</h2>
                  <p className="text-sm">Feature coming soon.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.filter(item => ['dashboard', 'machines', 'scan', 'maintenance', 'spare-parts'].includes(item.id)).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors relative",
              activeTab === item.id ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            {item.id === 'spare-parts' && (stats?.lowStock ?? 0) > 0 && (
              <span className="absolute top-0 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
