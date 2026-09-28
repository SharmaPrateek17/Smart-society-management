import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Wrench,
  Trophy,
  Star,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';

export const VendorPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Submit Quotation Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPoolForQuote, setSelectedPoolForQuote] = useState(null);
  const [quotePricePerUnit, setQuotePricePerUnit] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('');
  const [quoteAvailability, setQuoteAvailability] = useState('');

  useEffect(() => {
    loadVendorData();
  }, [user]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const [profRes, invRes, jobsRes, statsRes] = await Promise.all([
        api.get('/vendors/profile/me'),
        api.get('/vendors/invitations/me'),
        api.get('/vendors/jobs/me'),
        api.get('/stats/dashboard')
      ]);

      if (profRes.success) setProfile(profRes.vendor);
      if (invRes.success) setInvitations(invRes.invitations);
      if (jobsRes.success) setAssignedJobs(jobsRes.jobs);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error loading vendor data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (pool) => {
    setSelectedPoolForQuote(pool);
    // Suggest competitive pricing below market benchmark
    const benchmark = pool.category?.marketPrice || 45;
    setQuotePricePerUnit((benchmark * 0.65).toFixed(1));
    setQuoteTerms('Includes jet cleaning, standard warranty, and skilled technicians.');
    setQuoteAvailability('Available this upcoming weekend');
    setQuoteModalOpen(true);
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!selectedPoolForQuote || !quotePricePerUnit) return;

    try {
      const total = parseFloat(quotePricePerUnit) * (selectedPoolForQuote._count?.requests || selectedPoolForQuote.requests?.length || 1);
      const res = await api.post('/quotations', {
        poolId: selectedPoolForQuote.id,
        pricePerUnit: parseFloat(quotePricePerUnit),
        totalEstimate: total,
        terms: quoteTerms,
        availability: quoteAvailability
      });

      if (res.success) {
        setQuoteModalOpen(false);
        setSelectedPoolForQuote(null);
        loadVendorData();
        alert('Bulk quotation submitted successfully to the Society Administration!');
      }
    } catch (err) {
      alert(err.message || 'Failed to submit quote');
    }
  };

  const handleUpdateJobProgress = async (requestId, nextStatus) => {
    try {
      await api.patch(`/requests/${requestId}/status`, { status: nextStatus });
      loadVendorData();
      alert(`Job status updated to ${nextStatus}`);
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Vendor Hero Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Service Vendor Workspace</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                profile?.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {profile?.verificationStatus || 'VERIFIED'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{profile?.businessName || user?.name}</h1>
            <p className="text-amber-200/80 text-sm mt-1 max-w-xl">
              Bid on aggregated high-volume society service drives and manage confirmed residential contracts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center space-x-3">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-lg font-bold leading-tight">{profile?.avgRating || 4.8} / 5.0</div>
                <div className="text-[11px] text-amber-200/70">{profile?.ratings?.length || 0} reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
        {[
          { id: 'dashboard', label: 'Overview', icon: <Wrench className="w-4 h-4" /> },
          { id: 'invitations', label: `Bidding Invitations (${invitations.length})`, icon: <Send className="w-4 h-4" /> },
          { id: 'jobs', label: `Assigned Contracts (${assignedJobs.length})`, icon: <Trophy className="w-4 h-4" /> },
          { id: 'reviews', label: `Customer Reviews (${profile?.ratings?.length || 0})`, icon: <Star className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-amber-600 text-amber-600 bg-amber-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>OPEN BID INVITATIONS</span>
                <Send className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{invitations.length}</div>
              <p className="text-xs text-slate-400 mt-1">Pools awaiting your quotation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>WON SOCIETY JOBS</span>
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">{assignedJobs.length}</div>
              <p className="text-xs text-slate-400 mt-1">Confirmed collective contracts</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>AVERAGE RATING</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{profile?.avgRating || 4.8}★</div>
              <p className="text-xs text-slate-400 mt-1">Based on verified resident reviews</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>COVERAGE AREA</span>
                <Building2 className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-base font-bold text-slate-800 mt-2 truncate">
                {profile?.serviceArea || 'Citywide'}
              </div>
              <p className="text-xs text-slate-400 mt-1">{profile?.servicesOffered}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-amber-950">Bulk Demand Procurement Benefits</h3>
              <p className="text-xs text-amber-900/80 mt-1 max-w-xl">
                Instead of marketing to one customer at a time with heavy acquisition costs, society pooling offers 10–50+ flats in a single apartment complex on a single weekend!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('invitations')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs shadow-sm transition-all whitespace-nowrap"
            >
              Review Open Invitations ({invitations.length}) →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BIDDING INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Pooled Demand Invitations</h2>
            <p className="text-xs text-slate-500">Societies actively requesting competitive bulk bids for upcoming service cycles</p>
          </div>

          <div className="space-y-4">
            {invitations.map((inv) => {
              const pool = inv.pool;
              const hasQuoted = pool.quotations?.length > 0;
              const myQuote = pool.quotations?.[0];

              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-slate-900">{pool.category?.name}</h3>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                          {pool._count?.requests || pool.requests?.length || 3} Flats Pooled
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {pool.society?.name}, {pool.society?.city} ({pool.society?.address})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-semibold block">Market Benchmark</span>
                      <span className="text-sm font-bold text-slate-700">
                        ${pool.category?.marketPrice}/flat (${(pool.category?.marketPrice || 45) * (pool._count?.requests || 3)} total)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div>
                      {hasQuoted ? (
                        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Quotation Submitted: <strong>${myQuote.pricePerUnit}/unit</strong> (${myQuote.totalEstimate} total estimate)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">
                          Cycle window ends: {new Date(pool.cycleEnd).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => handleOpenQuoteModal(pool)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{hasQuoted ? 'Update Quotation' : 'Submit Bulk Bid'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {invitations.length === 0 && (
              <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-2xl border border-slate-200">
                No active invitations. Society admins will invite you based on your verified services.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNED SOCIETY JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Confirmed Society Contracts</h2>
            <p className="text-xs text-slate-500">Collective service procurement contracts awarded to your business</p>
          </div>

          <div className="space-y-4">
            {assignedJobs.map((job) => {
              const pool = job.pool;

              return (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          CONTRACT WON
                        </span>
                        <h3 className="font-bold text-base text-slate-900">{pool.category?.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Society: {pool.society?.name} • Contract Awarded on {new Date(job.selectedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-semibold block">Total Revenue</span>
                      <span className="text-lg font-bold text-emerald-600">
                        ${pool.quotations?.[0]?.totalEstimate || 96}
                      </span>
                    </div>
                  </div>

                  {/* List of Resident Units to Service */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Resident Units & Execution Status ({pool.requests?.length || 0} Flats)
                    </h4>
                    <div className="space-y-2">
                      {pool.requests?.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">Flat {r.resident?.flatNumber}</span>
                            <span className="text-slate-500 ml-2">({r.resident?.name} • {r.resident?.phone || 'No phone'})</span>
                            <p className="text-slate-600 text-[11px] mt-0.5 italic">"{r.description}"</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'COMPLETED' || r.status === 'RATED' ? 'bg-emerald-100 text-emerald-800' :
                              r.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {r.status}
                            </span>

                            {r.status === 'ASSIGNED' && (
                              <button
                                onClick={() => handleUpdateJobProgress(r.id, 'IN_PROGRESS')}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white rounded font-medium"
                              >
                                Start Work
                              </button>
                            )}

                            {r.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateJobProgress(r.id, 'COMPLETED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {assignedJobs.length === 0 && (
              <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-2xl border border-slate-200">
                No active assigned contracts. Submit competitive quotations on open invitations!
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Resident Feedback & Ratings</h2>
            <p className="text-xs text-slate-500">Verified reviews submitted by society residents after service completion</p>
          </div>

          <div className="space-y-3">
            {profile?.ratings?.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{r.resident?.name}</span>
                    <span className="text-xs text-slate-500">Flat {r.resident?.flatNumber}</span>
                  </div>
                  <div className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{r.comment}"
                </p>
                <div className="text-[10px] text-slate-400 mt-2">
                  Submitted on {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}

            {(!profile?.ratings || profile.ratings.length === 0) && (
              <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-2xl border border-slate-200">
                No ratings received yet. Once jobs are completed, residents can leave feedback.
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUBMIT QUOTATION MODAL */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Submit Bulk Quotation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bidding for <strong>{selectedPoolForQuote?.category?.name}</strong> at {selectedPoolForQuote?.society?.name}.
            </p>

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quoted Price Per Flat / Unit ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={quotePricePerUnit}
                  onChange={(e) => setQuotePricePerUnit(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Total for {selectedPoolForQuote?._count?.requests || selectedPoolForQuote?.requests?.length || 3} units: $
                  {(parseFloat(quotePricePerUnit || 0) * (selectedPoolForQuote?._count?.requests || selectedPoolForQuote?.requests?.length || 3)).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Terms & Warranty</label>
                <textarea
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  placeholder="e.g. 30-day service guarantee, certified technicians..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Availability & Schedule</label>
                <input
                  type="text"
                  value={quoteAvailability}
                  onChange={(e) => setQuoteAvailability(e.target.value)}
                  placeholder="e.g. This Saturday 9:00 AM - 4:00 PM"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xs"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
