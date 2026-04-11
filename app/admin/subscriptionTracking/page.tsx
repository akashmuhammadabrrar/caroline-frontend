"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Users, DollarSign, TrendingUp, Calendar, 
  Download, Plus, Search, Eye, Edit, Loader2
} from 'lucide-react';
import { useGetSubscriptionTrackingDataQuery } from '@/redux/features/admin/adminDashboardApi';
import toast from 'react-hot-toast';

const SubscriptionTrackingPage = () => {
  const { data: apiResponse, isLoading, isError } = useGetSubscriptionTrackingDataQuery();
  const token = useSelector((state: RootState) => state.auth?.accessToken);
  const [isExporting, setIsExporting] = useState(false);
  
  const [filter, setFilter] = useState<'All' | 'Active' | 'Cancelled' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = "http://98.81.136.120:9000/api";
      const res = await fetch(`${baseUrl}/admin-dashboard/subscription/export/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const csvText = await res.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-export-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export downloaded successfully!');
    } catch {
      toast.error('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  // Extract data safely, anticipating either a direct object or wrapped in `data` (if standard response wrapper is used)
  const dashboardData = apiResponse && 'data' in apiResponse ? (apiResponse as any).data : apiResponse;
  
  const subscriptions = dashboardData?.subscriptions || [];

  const filteredData = subscriptions.filter((user: any) => {
    const matchesFilter = filter === 'All' || user.status === filter;
    const matchesSearch = user.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0f111f] flex text-white items-center justify-center">
        <p className="text-red-400">Failed to load subscription data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111f] text-white p-6 md:p-8 font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-cyan-400">Subscription</span> 
          <span className="text-[#a855f7]">Tracking</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Track and manage all user subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-[#1e293b]"
          title="Total Subscribers"
          value={dashboardData?.totalSubscribers?.toLocaleString() || "0"}
          change="+0%" 
          changeType="positive"
        />
        <StatCard 
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-[#1e293b]"
          title="Monthly Revenue"
          value={`€${(dashboardData?.monthlyRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+0%"
          changeType="positive"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-[#1e293b]"
          title="Active Subscriptions"
          value={dashboardData?.activeSubscriptions?.toLocaleString() || "0"}
          change="+0%"
          changeType="positive"
        />
        <StatCard 
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-[#1e293b]"
          title="Expiring This Month"
          value={dashboardData?.expiringThisMonth?.toLocaleString() || "0"}
          change="-0%"
          changeType="negative"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#171b2f] border border-white/5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
        <Link 
          href="/admin/subscriptionTracking/plans"
          className="flex items-center gap-2 px-4 py-2 bg-[#00d8b6] text-white rounded-lg text-sm font-medium hover:bg-[#00c2a3] transition-colors shadow-lg shadow-[#00d8b6]/20"
        >
          <Plus className="w-4 h-4" />
          Manage Plans
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#171b2f] border border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or user ID..." 
            className="w-full bg-[#0a0c16] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex bg-[#0a0c16] p-1 rounded-lg border border-gray-800">
          {['All', 'Active', 'Cancelled', 'Expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all ${
                filter === f 
                  ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171b2f] border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#171b2f] text-gray-200 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Plan</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Next Billing</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Auto-Renew</th>
              <th className="px-6 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredData.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-4 text-gray-200">{row.user}</td>
                <td className="px-6 py-4 text-gray-400">{row.email}</td>
                <td className="px-6 py-4 text-cyan-400 font-medium">{row.plan}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                    row.status?.toLowerCase() === 'active' 
                      ? 'bg-green-500/10 text-green-500' 
                      : row.status?.toLowerCase() === 'cancelled'
                        ? 'bg-yellow-600/20 text-yellow-600'
                        : 'bg-red-500/10 text-red-500'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{row.nextBilling}</td>
                <td className="px-6 py-4 text-gray-200 whitespace-nowrap">
                   {Number(row.amount) > 0 ? `€${row.amount}` : "€0.00"}
                </td>
                <td className="px-6 py-4">
                  <span className={`${row.autoRenew?.toLowerCase() === 'enabled' ? 'text-green-500' : 'text-gray-500'}`}>
                    {row.autoRenew}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-4 text-gray-400">
                  <Link 
                    href={`/admin/subscriptionTracking/${row.id || row.subscriptionId || row.subscription_id || row.userId || row.user_id || (i + 2)}`} 
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-cyan-500" />
                  </Link>
                  <button className="hover:text-fuchsia-400 transition-colors">
                    <Edit className="w-4 h-4 text-fuchsia-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No subscriptions found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Component
const StatCard = ({ icon, iconBg, title, value, change, changeType }: {
  icon: React.ReactNode, iconBg: string, title: string, value: string, change: string, changeType: 'positive' | 'negative'
}) => (
  <div className="bg-[#171b2f] border border-gray-800 rounded-xl p-5 relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-yellow-500'}`}>
        {change}
      </span>
    </div>
    <div className="space-y-1">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
)

export default SubscriptionTrackingPage;
