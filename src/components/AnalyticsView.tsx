import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { translations } from '../utils/translations';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  Activity,
  Bed,
  DollarSign,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { invoices, patients, beds, language } = useHospital();
  const t = translations[language];

  // Monthly Revenue Data
  const monthlyRevenueData = [
    { month: 'Oct', revenue: 14500000, target: 12000000 },
    { month: 'Nov', revenue: 16800000, target: 14000000 },
    { month: 'Dec', revenue: 19200000, target: 15000000 },
    { month: 'Jan', revenue: 18400000, target: 16000000 },
    { month: 'Feb', revenue: 21500000, target: 17000000 },
    { month: 'Mar', revenue: 23800000, target: 18000000 },
  ];

  // Department Utilization Data
  const departmentUtilization = [
    { department: 'Surgery / OT', cases: 88, bedDays: 310 },
    { department: 'Internal Medicine', cases: 142, bedDays: 520 },
    { department: 'Maternity / L&D', cases: 94, bedDays: 280 },
    { department: 'Emergency & Trauma', cases: 210, bedDays: 140 },
    { department: 'Pediatrics', cases: 65, bedDays: 210 },
    { department: 'Dental Clinic', cases: 120, bedDays: 15 },
  ];

  // Payment Providers Distribution
  const paymentChannelData = [
    { name: 'MTN MoMo', value: 45, color: '#eab308' },
    { name: 'RAMA / RSSB Insurance', value: 30, color: '#8b5cf6' },
    { name: 'Visa & Mastercard', value: 12, color: '#3b82f6' },
    { name: 'Cash Desk', value: 8, color: '#10b981' },
    { name: 'Airtel Money', value: 5, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            {t.analytics.analytics} & Business Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clinical analytics, revenue trajectory, service line throughput & provider collection trends.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            FY 2025 - 2026 Reporting Year
          </span>
        </div>
      </div>

      {/* BI Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Average Length of Stay (ALOS)</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">3.4 Days</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">&darr; 0.4 days improvement YoY</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Bed Turnover Interval</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">1.2 Days</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Rapid sanitization & turnover</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Patient Satisfaction Index</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1 font-mono">94.8%</div>
          <div className="text-[11px] text-yellow-400/80 mt-0.5">Post-discharge SMS survey</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Insurance Adjudication Rate</div>
          <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">98.2%</div>
          <div className="text-[11px] text-purple-400/80 mt-0.5">RAMA / MMI / Mutuelle clean claims</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Trend */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Monthly Hospital Collections (RWF)
            </h3>
            <span className="text-xs text-slate-400">Actual vs Target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} RWF`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Collected" />
                <Area type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="4 4" fill="none" name="Budget" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Throughput Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Department Clinical Volume & Bed Days
            </h3>
            <span className="text-xs text-slate-400">Current Month</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="cases" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Admissions" />
                <Bar dataKey="bedDays" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bed Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Donut Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-yellow-400" />
              Payment Gateway Channel Share (%)
            </h3>
            <span className="text-xs text-slate-400">MoMo vs Cards vs Insurance</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChannelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentChannelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val) => [`${val}% Share`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[11px] text-slate-300">
            {paymentChannelData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* Clinical Quality & Compliance Indicators */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              MINISANTE National Hospital Quality Benchmarks
            </h3>
            <span className="text-xs text-emerald-400 font-bold">100% Compliant</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">Surgical Site Infection (SSI) Rate</div>
                <div className="text-slate-400 text-[11px]">Benchmark &lt; 1.5%</div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">0.6%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">30-Day Unplanned Readmission Rate</div>
                <div className="text-slate-400 text-[11px]">Benchmark &lt; 5.0%</div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">2.8%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">Emergency Door-to-Doctor Time</div>
                <div className="text-slate-400 text-[11px]">Trauma Triage Standard</div>
              </div>
              <span className="font-mono font-bold text-cyan-300 text-sm">11.4 mins</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">Hand Hygiene Compliance Audit</div>
                <div className="text-slate-400 text-[11px]">WHO Multi-modal Protocol</div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">96.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
