import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  Wrench,
  CheckCircle2,
  XCircle,
  Plus,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const SuperAdminPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [societies, setSocieties] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Society Modal
  const [socModalOpen, setSocModalOpen] = useState(false);
  const [socName, setSocName] = useState('');
  const [socAddress, setSocAddress] = useState('');
  const [socCity, setSocCity] = useState('');
  const [socFlats, setSocFlats] = useState('100');
  const [socAdminName, setSocAdminName] = useState('');
  const [socAdminEmail, setSocAdminEmail] = useState('');
  const [socAdminPassword, setSocAdminPassword] = useState('admin123');

  useEffect(() => {
    loadSuperAdminData();
  }, [user]);

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      const [socRes, venRes, statsRes] = await Promise.all([
        api.get('/societies'),
        api.get('/vendors'),
        api.get('/stats/dashboard')
      ]);

      if (socRes.success) setSocieties(socRes.societies);
      if (venRes.success) setVendors(venRes.vendors);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error loading super admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVendor = async (vendorId, status) => {
    try {
      const res = await api.patch(`/vendors/${vendorId}/verify`, { status });
      if (res.success) {
        loadSuperAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update vendor status');
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/societies', {
        name: socName,
        address: socAddress,
        city: socCity,
        totalFlats: parseInt(socFlats),
        adminName: socAdminName,
        adminEmail: socAdminEmail,
        adminPassword: socAdminPassword
      });

      if (res.success) {
        setSocModalOpen(false);
        setSocName('');
        setSocAddress('');
        setSocCity('');
        setSocAdminName('');
        setSocAdminEmail('');
        loadSuperAdminData();
        alert('Residential society onboarded successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to onboard society');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Master Governance</span>
              <span>•</span>
              <span>Super Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Platform Governance Center</h1>
            <p className="text-purple-200/80 text-sm mt-1 max-w-xl">
              Onboard residential societies, verify service contractors, and monitor ecosystem-wide demand pooling.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSocModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-500/20 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Society</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
        {[
          { id: 'dashboard', label: 'Overview Metrics', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'societies', label: `Onboarded Societies (${societies.length})`, icon: <Building2 className="w-4 h-4" /> },
          { id: 'vendors', label: `Vendor Verification Queue (${vendors.length})`, icon: <Wrench className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 bg-purple-50/50 rounded-t-lg'
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
                <span>ONBOARDED SOCIETIES</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{stats?.societiesCount || societies.length}</div>
              <p className="text-xs text-slate-400 mt-1">Managed apartment complexes</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>REGISTERED VENDORS</span>
                <Wrench className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{stats?.vendorsCount || vendors.length}</div>
              <p className="text-xs text-slate-400 mt-1">
                {vendors.filter(v => v.verificationStatus === 'VERIFIED').length} verified contractors
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>TOTAL DEMAND POOLS</span>
                <Layers className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{stats?.totalPools || 2} Cycles</div>
              <p className="text-xs text-slate-400 mt-1">Across all categories</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>COMMUNITY SAVINGS</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                {stats?.estimatedCommunitySavings || '$4,850'}
              </div>
              <p className="text-xs text-slate-400 mt-1">Saved through bulk procurement</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOCIETIES */}
      {activeTab === 'societies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Residential Societies</h2>
              <p className="text-xs text-slate-500">Active communities utilizing SmartNexus management & collective bidding</p>
            </div>
            <button
              onClick={() => setSocModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Society</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {societies.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.address}, {s.city}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    {s.totalFlats} Flats
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Society Administrator</span>
                    <span className="font-semibold text-slate-700">{s.admin?.name || 'Unassigned'}</span>
                    <span className="text-slate-500 block text-[11px]">{s.admin?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Activity Stats</span>
                    <span className="text-slate-700 font-semibold">
                      {s._count?.members || 0} Residents • {s._count?.servicePools || 0} Pools
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR VERIFICATION QUEUE */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Vendor Verification Queue</h2>
            <p className="text-xs text-slate-500">Review and verify contractor credentials to ensure high quality society services</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Services Offered</th>
                  <th className="px-4 py-3">Service Area</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{v.businessName}</span>
                      <span className="text-slate-400 text-[11px]">{v.user?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{v.servicesOffered}</td>
                    <td className="px-4 py-3 text-slate-500">{v.serviceArea}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {v.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyVendor(v.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {v.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleVerifyVendor(v.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ONBOARD SOCIETY MODAL */}
      {socModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Onboard New Residential Society</h3>
            <p className="text-xs text-slate-500 mt-1">Register society details and assign the primary society administrator</p>

            <form onSubmit={handleCreateSociety} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Society Name</label>
                <input
                  type="text"
                  value={socName}
                  onChange={(e) => setSocName(e.target.value)}
                  placeholder="e.g. Royal Palms Residences"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={socCity}
                    onChange={(e) => setSocCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Flats</label>
                  <input
                    type="number"
                    value={socFlats}
                    onChange={(e) => setSocFlats(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={socAddress}
                  onChange={(e) => setSocAddress(e.target.value)}
                  placeholder="Street / Sector / Area"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-2">Secretary / Admin Credentials</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={socAdminName}
                      onChange={(e) => setSocAdminName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={socAdminEmail}
                      onChange={(e) => setSocAdminEmail(e.target.value)}
                      placeholder="admin@society.com"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSocModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-xs"
                >
                  Onboard Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
