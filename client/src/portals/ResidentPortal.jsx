import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Layers,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Star,
  Calendar,
  Building2,
  MessageSquare,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  Droplets,
  Wrench,
  AirVent,
  Check,
  ChevronRight
} from 'lucide-react';

export const ResidentPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Request Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqPreferredDate, setReqPreferredDate] = useState('');
  const [reqUrgency, setReqUrgency] = useState('NORMAL');
  const [reqSuccess, setReqSuccess] = useState('');

  // Complaint Form State
  const [compCategory, setCompCategory] = useState('Plumbing & Drainage');
  const [compDescription, setCompDescription] = useState('');
  const [compSuccess, setCompSuccess] = useState('');

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [targetRequestForRating, setTargetRequestForRating] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, reqsRes, compsRes, noticesRes, paysRes, statsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/requests?residentOnly=true'),
        api.get('/complaints'),
        api.get(`/notices?societyId=${user?.societyId}`),
        api.get('/payments'),
        api.get('/stats/dashboard')
      ]);

      if (catsRes.success) setCategories(catsRes.categories);
      if (reqsRes.success) setMyRequests(reqsRes.requests);
      if (compsRes.success) setComplaints(compsRes.complaints);
      if (noticesRes.success) setNotices(noticesRes.notices);
      if (paysRes.success) setPayments(paysRes.payments);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error loading resident portal data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !reqDescription) return;

    try {
      const res = await api.post('/requests', {
        categoryId: selectedCategory,
        description: reqDescription,
        preferredDate: reqPreferredDate || null,
        urgency: reqUrgency
      });

      if (res.success) {
        setReqSuccess(res.message);
        setReqDescription('');
        setReqPreferredDate('');
        loadData();
        setTimeout(() => {
          setReqSuccess('');
          setActiveTab('requests');
        }, 1500);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!compDescription) return;

    try {
      const res = await api.post('/complaints', {
        category: compCategory,
        description: compDescription
      });

      if (res.success) {
        setCompSuccess('Complaint filed successfully. Society management has been notified.');
        setCompDescription('');
        loadData();
        setTimeout(() => setCompSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to file complaint');
    }
  };

  const handleOpenRating = (req) => {
    setTargetRequestForRating(req);
    setRatingStars(5);
    setRatingComment('');
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!targetRequestForRating) return;

    try {
      const res = await api.post('/ratings', {
        serviceRequestId: targetRequestForRating.id,
        rating: ratingStars,
        comment: ratingComment
      });

      if (res.success) {
        setRatingModalOpen(false);
        setTargetRequestForRating(null);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const handleMarkPaymentPaid = async (paymentId) => {
    try {
      await api.patch(`/payments/${paymentId}/status`, { status: 'PAID' });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'RAISED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Raised</span>;
      case 'POOLED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" />
            Demand Pooled
          </span>
        );
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Vendor Assigned</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Completed</span>;
      case 'RATED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Completed & Rated</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Resident Welcome Banner */}
      <div className="rounded-xl border-2 border-[#272221] bg-[#1D7753] p-6 text-[#FAF7F0] shadow-[4px_4px_0_0_#272221] mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#F08C1E] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Resident Hub</span>
              <span>•</span>
              <span>Flat {user?.flatNumber || 'A-101'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Welcome back, {user?.name}</h1>
            <p className="text-[#FAF7F0]/80 text-sm mt-1 max-w-xl font-normal">
              Pool service requests with your Sunrise Heights neighbors to unlock up to 45% bulk discounts from verified vendors.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('new-request')}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2.5 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221] hover:-translate-y-0.5 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pool a Service Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Nivaas OS Filter Pills) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
          { id: 'new-request', label: 'Raise Service Request', icon: <PlusCircle className="w-4 h-4" /> },
          { id: 'requests', label: `My Requests (${myRequests.length})`, icon: <Layers className="w-4 h-4" /> },
          { id: 'complaints', label: `Complaints (${complaints.length})`, icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'notices', label: `Notices Feed (${notices.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'dues', label: 'Maintenance Dues', icon: <CreditCard className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full border-2 border-[#272221] px-4 py-2 text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-[#272221] text-[#FAF7F0] shadow-xs'
                : 'bg-[#FAF7F0] hover:bg-[#1D7753]/10 text-[#272221]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>ACTIVE REQUESTS</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                {stats?.myActiveRequestsCount ?? myRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'RATED').length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently pooled or in progress</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>ESTIMATED POOL SAVINGS</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">~35% - 48%</div>
              <p className="text-xs text-slate-400 mt-1">Bulk negotiation leverage</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>COMPLAINTS STATUS</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                {complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length} Open
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {complaints.filter(c => c.status === 'RESOLVED').length} resolved recently
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>MAINTENANCE DUES</span>
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                {payments.some(p => p.status === 'PENDING' || p.status === 'OVERDUE') ? (
                  <span className="text-rose-600">Pending</span>
                ) : (
                  <span className="text-emerald-600">All Clear</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {payments.find(p => p.status === 'PAID')?.month || 'Current Month'} Paid
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Service Demand Pools Banner */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Current Demand Pooling Drives</h2>
                  <p className="text-xs text-slate-500">Services being actively aggregated across society flats</p>
                </div>
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="text-xs text-sky-600 font-semibold hover:underline flex items-center"
                >
                  Join Pool <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveTab('new-request');
                    }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Save ~40%
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mt-3 group-hover:text-sky-700">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Market: ${cat.marketPrice}</span>
                      <span className="font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                        Request <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Society Notices Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Latest Notices</h2>
                  <span className="text-xs font-semibold text-sky-600 cursor-pointer hover:underline" onClick={() => setActiveTab('notices')}>
                    View All
                  </span>
                </div>

                <div className="space-y-3">
                  {notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className={`px-2 py-0.5 rounded ${
                          notice.category === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                          notice.category === 'WATER' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {notice.category}
                        </span>
                        <span className="text-slate-400">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{notice.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notice.content}</p>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">No notices posted yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Society: {user?.society?.name}</span>
                <span className="font-medium text-slate-700">Jaipur</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: RAISE SERVICE REQUEST */}
      {activeTab === 'new-request' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automatic Demand Aggregation</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Raise a Service Request</h2>
            <p className="text-sm text-slate-500 mt-1">
              Your request will be grouped with other residents in {user?.society?.name} to negotiate collective bulk rates with verified vendors.
            </p>
          </div>

          {reqSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reqSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateRequest} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Service Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedCategory === cat.id
                        ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800">{cat.name}</span>
                      {selectedCategory === cat.id && (
                        <Check className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                    <div className="text-[11px] text-emerald-600 font-medium mt-2">
                      Individual market rate: ~${cat.marketPrice} | Pooled bulk target: ~${Math.round(cat.marketPrice * 0.55)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Describe Details / Specific Issues
              </label>
              <textarea
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="e.g. Need 2 split AC units serviced in master and living room. Low cooling."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Preferred Service Date
                </label>
                <input
                  type="date"
                  value={reqPreferredDate}
                  onChange={(e) => setReqPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Urgency
                </label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="NORMAL">Normal (Standard 7-day pooling cycle)</option>
                  <option value="HIGH">High (Within 3-4 days)</option>
                  <option value="URGENT">Urgent (Immediate standalone dispatch, outside pool)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedCategory || !reqDescription}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Submit & Pool Demand
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MY REQUESTS & LIVE TRACKER */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Service Requests</h2>
              <p className="text-xs text-slate-500">Track demand pool aggregation, vendor assignment, and work status</p>
            </div>
            <button
              onClick={() => setActiveTab('new-request')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-semibold text-xs shadow-sm hover:bg-sky-500"
            >
              + Raise Another
            </button>
          </div>

          <div className="space-y-4">
            {myRequests.map((req) => {
              const statusSteps = ['RAISED', 'POOLED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'];
              const currentStepIdx = statusSteps.indexOf(req.status);

              return (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{req.category?.name}</h3>
                        {renderStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Requested on {new Date(req.createdAt).toLocaleDateString()} • Flat {user?.flatNumber}
                      </p>
                    </div>
                    {req.pool?.vendorSelection && (
                      <div className="text-right sm:border-l sm:pl-4 border-slate-200">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Assigned Vendor</span>
                        <p className="text-sm font-bold text-slate-800">
                          {req.pool.vendorSelection.selectedVendor.businessName}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-700 my-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{req.description}"
                  </p>

                  {/* Visual Stepper Lifecycle Bar */}
                  <div className="pt-2 pb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-3">Service Lifecycle:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: '1. Raised', key: 'RAISED' },
                        { label: '2. Pooled', key: 'POOLED' },
                        { label: '3. Assigned', key: 'ASSIGNED' },
                        { label: '4. In Progress', key: 'IN_PROGRESS' },
                        { label: '5. Completed', key: 'COMPLETED' }
                      ].map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                          <div key={step.key} className="text-center">
                            <div
                              className={`h-2 rounded-full mb-1 transition-all ${
                                isDone ? 'bg-sky-600' : 'bg-slate-200'
                              } ${isCurrent ? 'ring-2 ring-sky-400 ring-offset-1' : ''}`}
                            />
                            <span className={`text-[10px] font-medium block truncate ${
                              isDone ? 'text-sky-700 font-semibold' : 'text-slate-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions (Rating) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Urgency: <span className="font-semibold text-slate-700">{req.urgency}</span>
                    </span>
                    <div>
                      {req.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenRating(req)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate Vendor & Review</span>
                        </button>
                      )}
                      {req.status === 'RATED' && req.rating && (
                        <div className="flex items-center space-x-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Rated {req.rating.rating}/5 Stars</span>
                          <span className="text-slate-400 font-normal">("{req.rating.comment}")</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {myRequests.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700">No requests raised yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Raise a service request to test society demand pooling and bulk negotiations.
                </p>
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-500"
                >
                  Raise Service Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* File Complaint Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Raise a Complaint</h3>
            <p className="text-xs text-slate-500 mb-4">Society administration will review and assign maintenance staff</p>

            {compSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {compSuccess}
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="Plumbing & Drainage">Plumbing & Drainage</option>
                  <option value="Lift & Elevator">Lift & Elevator</option>
                  <option value="Common Lighting & Power">Common Lighting & Power</option>
                  <option value="Security & Gate Access">Security & Gate Access</option>
                  <option value="Cleanliness & Waste">Cleanliness & Waste</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={compDescription}
                  onChange={(e) => setCompDescription(e.target.value)}
                  placeholder="Provide specific details of the issue..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={!compDescription}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Submit Complaint
              </button>
            </form>
          </div>

          {/* Complaints History List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Complaints Log</h3>
            {complaints.map((comp) => (
              <div key={comp.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">{comp.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      comp.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : comp.status === 'IN_REVIEW'
                        ? 'bg-blue-100 text-blue-800'
                        : comp.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{comp.description}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Logged: {new Date(comp.createdAt).toLocaleDateString()}</span>
                  {comp.resolvedAt && (
                    <span className="text-emerald-600 font-semibold">
                      Resolved on: {new Date(comp.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No complaints logged.</p>
            )}
          </div>

        </div>
      )}

      {/* TAB 5: NOTICES FEED */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Society Notice Board</h2>
            <p className="text-xs text-slate-500">Official circulars and announcements from Society Management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{notice.title}</h3>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{notice.content}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Posted by: {notice.admin?.name || 'Society Office'}</span>
                  <span>{user?.society?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DUES & PAYMENTS */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Maintenance & Dues</h2>
              <p className="text-xs text-slate-500">Logged payment records and digital receipt slips</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Billing Month</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Receipt / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.month}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">${p.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'PAID' ? (
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="text-sky-600 hover:text-sky-800 font-semibold underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaymentPaid(p.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-500"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No maintenance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RATING & REVIEW MODAL */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">Rate Vendor Service</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your review will help society admins choose the best vendors for future pooled services.
            </p>

            <form onSubmit={handleSubmitRating} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= ratingStars ? 'fill-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review Comments</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="How was the work quality, punctuality, and behavior of the technicians?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="text-center border-b border-slate-100 pb-4">
              <Building2 className="w-8 h-8 text-sky-600 mx-auto mb-1" />
              <h3 className="font-bold text-base text-slate-900">{user?.society?.name}</h3>
              <p className="text-xs text-slate-500">Official Society Maintenance Receipt</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceipt.receiptUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resident / Flat:</span>
                <span className="font-semibold text-slate-800">{user?.name} (Flat {user?.flatNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Month:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : 'Paid'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <span className="font-bold text-slate-700">Total Paid:</span>
                <span className="font-bold text-emerald-600">${selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
