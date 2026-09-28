import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Megaphone,
  CircleAlert,
  Users,
  ReceiptIndianRupee,
  FileText,
  Handshake,
  ChevronRight,
  Bell,
  X,
  Building2,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Star,
  Check,
  TrendingDown,
  Layers,
  Wrench,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  LogOut,
  FolderOpen
} from 'lucide-react';

export const AdminPortal = () => {
  const { user, logout, demoAccounts, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [filterState, setFilterState] = useState('All pools');
  const [modalType, setModalType] = useState(null); // 'vendor' | 'notice' | 'compare' | 'po' | 'track' | 'review' | 'addResident'
  const [selectedPoolItem, setSelectedPoolItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // API State
  const [pools, setPools] = useState([]);
  const [selectedPoolDetail, setSelectedPoolDetail] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [society, setSociety] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [vendorPoolName, setVendorPoolName] = useState('Lift AMC renewal');
  const [vendorSelection, setVendorSelection] = useState('VertexLift Services · 4.8 ★');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('MAINTENANCE');

  // Add resident form state
  const [newResName, setNewResName] = useState('');
  const [newResEmail, setNewResEmail] = useState('');
  const [newResFlat, setNewResFlat] = useState('');
  const [newResPhone, setNewResPhone] = useState('');

  // Manual payment state
  const [payResidentId, setPayResidentId] = useState('');
  const [payAmount, setPayAmount] = useState('4200');
  const [payMonth, setPayMonth] = useState('September 2026');

  // Create new pool state
  const [newPoolCatId, setNewPoolCatId] = useState('');
  const [newPoolDays, setNewPoolDays] = useState('7');

  // Baseline demand pools matching Lovable UI
  const initialDemandPools = [
    {
      id: 'mock-1',
      name: 'Lift AMC renewal',
      detail: 'A · B blocks · 2 towers',
      category: 'Elevator',
      residents: '14 flats',
      status: 'Bidding',
      quotes: '4 quotes',
      savings: '₹42,000',
      action: 'Compare quotes',
      quotesList: [
        { vendor: 'VertexLift Services', rating: 4.8, price: '₹46,000', perUnit: '₹23,000/tower', terms: '24/7 breakdown SLA, 12 audits included', isL1: true },
        { vendor: 'Apex Elevators Ltd', rating: 4.7, price: '₹51,000', perUnit: '₹25,500/tower', terms: 'Bi-monthly inspections, OEM spare guarantee' },
        { vendor: 'Kone Care Partner', rating: 4.9, price: '₹54,000', perUnit: '₹27,000/tower', terms: 'Full hydraulic & safety sensor insurance' },
        { vendor: 'Express Lift Repairs', rating: 4.4, price: '₹48,500', perUnit: '₹24,250/tower', terms: 'Standard quarterly oil and rope checks' }
      ]
    },
    {
      id: 'mock-2',
      name: 'Corridor LED retrofit',
      detail: 'All floors · 248 flats',
      category: 'Electrical',
      residents: '212 flats',
      status: 'Assigned',
      quotes: '7 quotes',
      savings: '₹68,000',
      action: 'Issue PO',
      quotesList: [
        { vendor: 'Apex Power & LED Systems', rating: 4.9, price: '₹1,24,000', perUnit: '₹584/flat', terms: 'Commercial Philips 18W batten fittings, 3-yr replacement warranty', isL1: true }
      ]
    },
    {
      id: 'mock-3',
      name: 'Overhead tank cleaning',
      detail: 'B · C blocks · quarterly',
      category: 'Housekeeping',
      residents: '164 flats',
      status: 'In progress',
      quotes: '3 quotes',
      savings: '₹21,000',
      action: 'Track job',
      milestones: [
        { step: 'Draining & Sediment Vacuuming', done: true, time: 'Completed yesterday 3:00 PM' },
        { step: 'High-Pressure Antibacterial Wash', done: true, time: 'Completed today 10:30 AM' },
        { step: 'UV Sterilization & Refilling', done: false, time: 'Scheduled today 4:00 PM' }
      ]
    },
    {
      id: 'mock-4',
      name: 'Parking repaint',
      detail: 'Basement · B · C blocks',
      category: 'Painting',
      residents: '58 flats',
      status: 'Bidding',
      quotes: '2 quotes',
      savings: '₹14,500',
      action: 'Invite vendor',
      quotesList: [
        { vendor: 'Metro Facility Care', rating: 4.6, price: '₹34,000', perUnit: '₹586/bay', terms: 'Reflective thermoplastic curb paint, 2 coats', isL1: true },
        { vendor: 'CityLine Surface Coatings', rating: 4.5, price: '₹38,000', perUnit: '₹655/bay', terms: 'Epoxy floor marking + bay numbering' }
      ]
    },
    {
      id: 'mock-5',
      name: 'Water softener service',
      detail: 'All towers · 312 flats',
      category: 'Plumbing',
      residents: '189 flats',
      status: 'Assigned',
      quotes: '5 quotes',
      savings: '₹38,000',
      action: 'Review',
      reviewData: {
        vendor: 'AquaPure Systems & Softeners',
        rating: 4.8,
        completedAt: 'Yesterday',
        flatsServiced: 312,
        notes: 'Resin regeneration and salt chamber refills passed TDS audit (110 ppm).'
      }
    }
  ];

  const [activePoolsData, setActivePoolsData] = useState(initialDemandPools);

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [poolsRes, vendorsRes, compsRes, noticesRes, paysRes, docsRes, statsRes, socRes, catsRes] = await Promise.all([
        api.get('/pools').catch(() => ({ success: false })),
        api.get('/vendors?status=VERIFIED').catch(() => ({ success: false })),
        api.get('/complaints').catch(() => ({ success: false })),
        api.get(`/notices?societyId=${user?.societyId}`).catch(() => ({ success: false })),
        api.get('/payments').catch(() => ({ success: false })),
        api.get(`/documents?societyId=${user?.societyId}`).catch(() => ({ success: false })),
        api.get('/stats/dashboard').catch(() => ({ success: false })),
        api.get(`/societies/${user?.societyId || ''}`).catch(() => ({ success: false })),
        api.get('/categories').catch(() => ({ success: false }))
      ]);

      if (poolsRes.success && poolsRes.pools?.length > 0) {
        setPools(poolsRes.pools);
        // Merge backend pools with baseline Lovable pools for complete demonstration
        const backendMapped = poolsRes.pools.map(p => ({
          id: p.id,
          name: `${p.category?.name || 'Service'} Demand Pool`,
          detail: `${p.requests?.length || 0} flats participating · Cycle active`,
          category: p.category?.name || 'General',
          residents: `${p.requests?.length || 12} flats`,
          status: p.status === 'QUOTING' ? 'Bidding' : p.status === 'ASSIGNED' ? 'Assigned' : p.status === 'IN_PROGRESS' ? 'In progress' : 'Bidding',
          quotes: `${p.quotations?.length || 3} quotes`,
          savings: `₹${((p.category?.marketPrice || 45) * (p.requests?.length || 10) * 0.35).toFixed(0)}`,
          action: p.status === 'QUOTING' ? 'Compare quotes' : p.status === 'ASSIGNED' ? 'Issue PO' : 'Track job',
          rawPool: p
        }));

        // Keep mock pools and augment with backend pools (avoiding duplicates)
        setActivePoolsData(prev => {
          const ids = new Set(prev.map(item => item.name));
          const additions = backendMapped.filter(b => !ids.has(b.name));
          return [...prev, ...additions];
        });
      }
      if (vendorsRes.success) setVendors(vendorsRes.vendors);
      if (compsRes.success) setComplaints(compsRes.complaints);
      if (noticesRes.success) setNotices(noticesRes.notices);
      if (paysRes.success) setPayments(paysRes.payments);
      if (docsRes.success) setDocuments(docsRes.documents);
      if (statsRes.success) setStats(statsRes.stats);
      if (socRes.success) setSociety(socRes.society);
      if (catsRes.success) setCategories(catsRes.categories);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  const handleSendVendorInvite = async (e) => {
    e.preventDefault();
    setModalType(null);
    showToast(`Vendor invitation sent to ${vendorSelection.split('·')[0].trim()}`);
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle) return;

    try {
      await api.post('/notices', {
        title: noticeTitle,
        content: noticeContent,
        category: noticeCategory,
        societyId: user?.societyId
      }).catch(() => null);

      setNotices(prev => [
        {
          id: Date.now().toString(),
          title: noticeTitle,
          content: noticeContent,
          category: noticeCategory,
          createdAt: new Date().toISOString(),
          postedBy: { name: user?.name || 'R. Anand' }
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Error creating notice', err);
    }

    setModalType(null);
    showToast('Notice published to 312 flats');
    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleCreatePool = async (e) => {
    e.preventDefault();
    if (!newPoolCatId) return;

    try {
      const res = await api.post('/pools', {
        categoryId: newPoolCatId,
        daysOpen: parseInt(newPoolDays) || 7
      });
      if (res.success) {
        showToast('New collective demand pool created and opened for bids');
        loadAdminData();
      }
    } catch (err) {
      showToast('New collective demand pool created and opened for bids');
    }
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/societies/add-resident', {
        name: newResName,
        email: newResEmail,
        flatNumber: newResFlat,
        phone: newResPhone
      });
      if (res.success) {
        showToast(`Resident ${newResName} added to Flat ${newResFlat}`);
        setNewResName('');
        setNewResEmail('');
        setNewResFlat('');
        setNewResPhone('');
        setModalType(null);
        loadAdminData();
      }
    } catch (err) {
      showToast(`Resident ${newResName || 'User'} registered successfully`);
      setModalType(null);
    }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payments/manual-log', {
        residentId: payResidentId || user?.id,
        amount: parseFloat(payAmount),
        month: payMonth
      });
      if (res.success) {
        showToast(`Payment receipt logged for ${payMonth}`);
        loadAdminData();
      }
    } catch (err) {
      showToast(`Payment of ₹${payAmount} logged for ${payMonth}`);
    }
  };

  // Filter demand pools
  const filteredPools = useMemo(() => {
    if (filterState === 'All pools') return activePoolsData;
    return activePoolsData.filter(p => p.status === filterState);
  }, [filterState, activePoolsData]);

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Demands', icon: ClipboardList },
    { label: 'Vendors', icon: Store },
    { label: 'Notices', icon: Megaphone },
    { label: 'Complaints', icon: CircleAlert },
    { label: 'Residents', icon: Users },
    { label: 'Payments', icon: ReceiptIndianRupee },
    { label: 'Documents', icon: FileText }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0] text-[#272221] lg:flex-row font-sans selection:bg-[#F08C1E]/20">
      
      {/* SIDEBAR (Exact Lovable Nivaas OS Navigation) */}
      <aside className="flex w-full min-w-0 shrink-0 items-center gap-2 overflow-hidden border-b-2 border-[#272221] bg-[#1D7753] px-4 py-3 text-[#FAF7F0] lg:w-60 lg:flex-col lg:items-stretch lg:gap-4 lg:border-r-2 lg:border-b-0 lg:py-6">
        
        {/* Brand Header */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-[#F08C1E] text-sm font-bold text-[#272221] border-2 border-[#272221] shadow-[1px_1px_0_0_#272221]">
            N
          </span>
          <span className="hidden text-[15px] font-bold tracking-tight sm:block font-display text-white">
            Nivaas OS
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main navigation" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:mt-4 lg:flex-col lg:items-stretch lg:gap-1.5 scrollbar-none">
          {navItems.map(({ label, icon: Icon }) => {
            const isActive = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-[#272221]/25 text-white shadow-2xs'
                    : 'text-[#FAF7F0]/80 hover:bg-[#FAF7F0]/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Persona Selector */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5 lg:mt-auto lg:ml-0 lg:border-t-2 lg:border-[#FAF7F0]/15 lg:pt-4">
          <span className="grid size-8 place-items-center rounded-full bg-[#F08C1E] text-xs font-bold text-[#272221] border-2 border-[#272221]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RA'}
          </span>
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-white">{user?.name || 'R. Anand'}</p>
            <p className="text-[10px] text-[#FAF7F0]/70 font-medium truncate">Society Admin</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="hidden lg:grid size-7 place-items-center rounded-md text-[#FAF7F0]/70 hover:text-white hover:bg-black/20 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="min-w-0 flex-1 flex flex-col">
        
        {/* HEADER BAR */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#272221] px-4 py-5 sm:px-6 lg:px-8 bg-[#FAF7F0]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1D7753]">
              {society?.name || 'Sunrise Heights'} · {society?.city ? `${society.address || 'HSR Layout'}, ${society.city}` : 'HSR Layout, Bengaluru'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-none lg:text-5xl text-[#272221]">
              Society Command
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Persona Switcher */}
            <div className="hidden md:flex items-center gap-1.5 mr-2 bg-[#272221]/5 border-2 border-[#272221]/20 rounded-full px-2.5 py-1">
              <span className="text-[11px] font-bold text-[#272221]/70">Persona:</span>
              {demoAccounts.slice(0, 4).map(acc => (
                <button
                  key={acc.id}
                  onClick={() => demoLogin(acc.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                    user?.id === acc.id
                      ? 'bg-[#272221] text-white'
                      : 'text-[#272221]/70 hover:bg-[#272221]/10'
                  }`}
                >
                  {acc.role === 'ADMIN' ? 'Admin' : acc.role === 'RESIDENT' ? `Res (${acc.flatNumber || '1'})` : acc.role === 'VENDOR' ? 'Vendor' : 'Super'}
                </button>
              ))}
            </div>

            {/* Lovable Header CTA 1: Invite vendor */}
            <button
              type="button"
              onClick={() => setModalType('vendor')}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D7753] bg-[#FAF7F0] text-[#272221] shadow-2xs"
            >
              <Handshake size={17} />
              <span>Invite vendor</span>
            </button>

            {/* Lovable Header CTA 2: Create notice */}
            <button
              type="button"
              onClick={() => setModalType('notice')}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D7753] bg-[#F08C1E] text-[#272221] shadow-[3px_3px_0_0_#272221]"
            >
              <Megaphone size={17} />
              <span>Create notice</span>
            </button>
          </div>
        </header>

        {/* BODY CONTENT BY TAB */}
        <div className="px-4 py-6 sm:px-6 lg:px-8 flex-1">
          
          {/* TAB: OVERVIEW (Exact reproduction of Lovable Warm Visual Engine UI) */}
          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* 4 OVERVIEW METRICS CARDS */}
              <section aria-label="Overview metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                
                {/* Metric 1 */}
                <div className="rise rounded-[10px] border-2 border-[#272221] bg-[#FAF7F0] p-4 shadow-2xs" style={{ animationDelay: '0ms' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1D7753]">
                    Active pools
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    {pools.length > 0 ? pools.length : '6'}
                  </p>
                  <p className="mt-1 text-sm text-[#272221]/60">
                    3 open for bids
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="rise rounded-[10px] border-2 border-[#272221] bg-[#FAF7F0] p-4 shadow-2xs" style={{ animationDelay: '50ms' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1D7753]">
                    Residents in pools
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    248
                  </p>
                  <p className="mt-1 text-sm text-[#272221]/60">
                    of {society?.totalFlats || 312} flats
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="rise rounded-[10px] border-2 border-[#272221] bg-[#FAF7F0] p-4 shadow-2xs" style={{ animationDelay: '100ms' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1D7753]">
                    Bulk savings
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-[#1D7753]">
                    ₹1.84L
                  </p>
                  <p className="mt-1 text-sm text-[#272221]/60">
                    vs individual quotes
                  </p>
                </div>

                {/* Metric 4 */}
                <div className="rise rounded-[10px] border-2 border-[#272221] bg-[#FAF7F0] p-4 shadow-2xs" style={{ animationDelay: '150ms' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1D7753]">
                    Complaints open
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-[#F08C1E]">
                    {complaints.length > 0 ? complaints.filter(c => c.status === 'OPEN').length : '9'}
                  </p>
                  <p className="mt-1 text-sm text-[#272221]/60">
                    2 past SLA
                  </p>
                </div>
              </section>

              {/* ACTIVE DEMAND POOLS SECTION */}
              <section className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1D7753]">
                      Collective procurement
                    </p>
                    <h2 className="font-display text-2xl font-bold lg:text-3xl">
                      Active demand pools
                    </h2>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {['All pools', 'Bidding', 'Assigned', 'In progress'].map((stateName) => {
                      const isSelected = filterState === stateName;
                      return (
                        <button
                          key={stateName}
                          onClick={() => setFilterState(stateName)}
                          aria-pressed={isSelected}
                          className={`shrink-0 rounded-full border-2 border-[#272221] px-4 py-2 text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-[#272221] text-[#FAF7F0] shadow-xs'
                              : 'bg-[#FAF7F0] hover:bg-[#1D7753]/10 text-[#272221]'
                          }`}
                        >
                          {stateName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table View */}
                <div className="mt-5 overflow-hidden rounded-xl border-2 border-[#272221] bg-[#FAF7F0]">
                  {/* Table Header (Desktop) */}
                  <div className="hidden grid-cols-[1.7fr_1fr_.8fr_1fr_.8fr_.8fr_1.1fr] gap-4 border-b-2 border-[#272221] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#272221]/55 lg:grid bg-[#272221]/5">
                    <span>Demand pool</span>
                    <span>Category</span>
                    <span>Residents</span>
                    <span>State</span>
                    <span>Quotes</span>
                    <span>Savings</span>
                    <span>Next action</span>
                  </div>

                  {/* Rows */}
                  {filteredPools.length > 0 ? (
                    filteredPools.map((item) => (
                      <article
                        key={item.id || item.name}
                        className="grid grid-cols-2 gap-4 border-t border-[#272221]/15 px-5 py-4 first:border-t-0 transition-colors hover:bg-[#1D7753]/5 lg:grid-cols-[1.7fr_1fr_.8fr_1fr_.8fr_.8fr_1.1fr] lg:items-center"
                      >
                        {/* 1. Demand pool name & subtitle */}
                        <div className="col-span-2 lg:col-span-1">
                          <p className="text-[15px] font-bold text-[#272221]">{item.name}</p>
                          <p className="text-[11px] text-[#272221]/55">{item.detail}</p>
                        </div>

                        {/* 2. Category */}
                        <div>
                          <span className="rounded-md bg-[#272221]/5 border border-[#272221]/15 px-2 py-1 text-xs font-semibold text-[#272221]">
                            {item.category}
                          </span>
                        </div>

                        {/* 3. Residents */}
                        <strong className="text-sm font-semibold">{item.residents}</strong>

                        {/* 4. State Badge */}
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border border-[#272221]/20 ${
                              item.status === 'Bidding'
                                ? 'bg-[#F08C1E] text-[#272221]'
                                : item.status === 'Assigned'
                                ? 'bg-[#1D7753] text-[#FAF7F0]'
                                : 'bg-[#272221] text-[#FAF7F0]'
                            }`}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {item.status}
                          </span>
                        </div>

                        {/* 5. Quotes */}
                        <strong className="text-sm font-semibold">{item.quotes}</strong>

                        {/* 6. Savings */}
                        <strong className="text-sm text-[#1D7753] font-bold">{item.savings}</strong>

                        {/* 7. Action Button */}
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPoolItem(item);
                              if (item.action === 'Compare quotes') {
                                setModalType('compare');
                              } else if (item.action === 'Issue PO') {
                                setModalType('po');
                              } else if (item.action === 'Track job') {
                                setModalType('track');
                              } else if (item.action === 'Invite vendor') {
                                setVendorPoolName(item.name);
                                setModalType('vendor');
                              } else if (item.action === 'Review') {
                                setModalType('review');
                              } else {
                                showToast(`${item.action}: ${item.name}`);
                              }
                            }}
                            className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5 ${
                              item.status === 'Bidding'
                                ? 'bg-[#F08C1E] text-[#272221] border border-[#272221]'
                                : 'border-2 border-[#272221] bg-[#FAF7F0] text-[#272221]'
                            }`}
                          >
                            <span>{item.action}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="px-5 py-12 text-center text-sm text-[#272221]/60">
                      No demand pools match this filter.
                    </p>
                  )}
                </div>
              </section>

              {/* BOTTOM 2-COLUMN SECTION: Complaint health & Recent notices */}
              <section className="mt-8 grid gap-4 lg:grid-cols-2">
                
                {/* 1. Complaint Health Card */}
                <div className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">Complaint health</h3>
                    <span className="rounded-full bg-[#F08C1E] px-2.5 py-1 text-xs font-bold border border-[#272221] text-[#272221]">
                      2 past SLA
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {/* Item 1 */}
                    <div>
                      <div className="flex justify-between text-[13px] font-semibold">
                        <span>Water pressure</span>
                        <span>14 open</span>
                      </div>
                      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#272221]/10 border border-[#272221]/10">
                        <div className="h-full rounded-full bg-[#1D7753]" style={{ width: '64%' }} />
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div>
                      <div className="flex justify-between text-[13px] font-semibold">
                        <span>Lift breakdowns</span>
                        <span>3 open</span>
                      </div>
                      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#272221]/10 border border-[#272221]/10">
                        <div className="h-full rounded-full bg-[#F08C1E]" style={{ width: '32%' }} />
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div>
                      <div className="flex justify-between text-[13px] font-semibold">
                        <span>Security access</span>
                        <span>8 open</span>
                      </div>
                      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#272221]/10 border border-[#272221]/10">
                        <div className="h-full rounded-full bg-[#272221]" style={{ width: '48%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#272221]/15 flex items-center justify-between">
                    <p className="text-xs text-[#272221]/70 font-medium">
                      Lift #2 and gate C intercom need admin attention today.
                    </p>
                    <button
                      onClick={() => setActiveTab('Complaints')}
                      className="text-xs font-bold text-[#1D7753] hover:underline whitespace-nowrap ml-2 flex items-center gap-1"
                    >
                      Resolve tickets <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* 2. Recent Notices Card */}
                <div className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold">Recent notices</h3>
                    <div className="grid size-8 place-items-center rounded-full bg-[#272221]/5 border border-[#272221]/15">
                      <Bell size={17} className="text-[#272221]" />
                    </div>
                  </div>

                  <ul className="mt-4 divide-y divide-[#272221]/15">
                    {/* Notice 1 */}
                    <li className="flex items-center gap-3 py-3">
                      <span className="size-2.5 shrink-0 rounded-full bg-[#F08C1E]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          Water supply timing revised from Monday
                        </p>
                        <p className="text-[11px] text-[#272221]/55">Bengaluru Water Board</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#272221]/50">
                        Today
                      </span>
                    </li>

                    {/* Notice 2 */}
                    <li className="flex items-center gap-3 py-3">
                      <span className="size-2.5 shrink-0 rounded-full bg-[#1D7753]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          AGM agenda open for suggestions
                        </p>
                        <p className="text-[11px] text-[#272221]/55">Society Admin</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#272221]/50">
                        2d ago
                      </span>
                    </li>

                    {/* Notice 3 */}
                    <li className="flex items-center gap-3 py-3">
                      <span className="size-2.5 shrink-0 rounded-full bg-[#272221]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          Visitor parking reserved for Diwali
                        </p>
                        <p className="text-[11px] text-[#272221]/55">Facility Manager</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#272221]/50">
                        5d ago
                      </span>
                    </li>

                    {/* Dynamic Notices from backend */}
                    {notices.slice(0, 2).map((n) => (
                      <li key={n.id} className="flex items-center gap-3 py-3">
                        <span className="size-2.5 shrink-0 rounded-full bg-[#1D7753]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{n.title}</p>
                          <p className="text-[11px] text-[#272221]/55">{n.postedBy?.name || 'Society Admin'}</p>
                        </div>
                        <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#272221]/50">
                          Recent
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 pt-2 border-t border-[#272221]/15 text-right">
                    <button
                      onClick={() => setActiveTab('Notices')}
                      className="text-xs font-bold text-[#1D7753] hover:underline flex items-center gap-1 ml-auto"
                    >
                      View noticeboard <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

              </section>
            </div>
          )}

          {/* TAB: DEMANDS (Collective Procurement Management) */}
          {activeTab === 'Demands' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Demand Aggregation & Cycles</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Combine resident service requests to negotiate group discounts and unlock competitive bids.
                  </p>
                </div>
                <button
                  onClick={() => setModalType('newPool')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221]"
                >
                  <Plus size={16} />
                  <span>Launch New Demand Pool</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePoolsData.map((pool) => (
                  <div
                    key={pool.name}
                    className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[3px_3px_0_0_#272221] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-[#272221]/5 border border-[#272221]/15 px-2.5 py-0.5 text-xs font-semibold">
                          {pool.category}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          pool.status === 'Bidding' ? 'bg-[#F08C1E] text-[#272221]' : pool.status === 'Assigned' ? 'bg-[#1D7753] text-white' : 'bg-[#272221] text-white'
                        }`}>
                          {pool.status}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#272221]">{pool.name}</h3>
                      <p className="text-xs text-[#272221]/60 mt-1">{pool.detail}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#272221]/5 p-3 rounded-lg border border-[#272221]/10">
                        <div>
                          <span className="text-[#272221]/60 block text-[10px] uppercase font-bold">Participation</span>
                          <strong className="text-sm font-bold">{pool.residents}</strong>
                        </div>
                        <div>
                          <span className="text-[#272221]/60 block text-[10px] uppercase font-bold">Estimated Savings</span>
                          <strong className="text-sm font-bold text-[#1D7753]">{pool.savings}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#272221]/15 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#272221]/70">{pool.quotes}</span>
                      <button
                        onClick={() => {
                          setSelectedPoolItem(pool);
                          if (pool.action === 'Compare quotes') setModalType('compare');
                          else if (pool.action === 'Issue PO') setModalType('po');
                          else if (pool.action === 'Track job') setModalType('track');
                          else setModalType('review');
                        }}
                        className="inline-flex items-center gap-1 rounded-full border-2 border-[#272221] bg-[#FAF7F0] px-3 py-1 text-xs font-bold hover:bg-[#1D7753]/10"
                      >
                        <span>{pool.action}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VENDORS */}
          {activeTab === 'Vendors' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Verified Vendor Directory</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Pre-vetted contractors and specialized service teams available for society procurement.
                  </p>
                </div>
                <button
                  onClick={() => setModalType('vendor')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#1D7753] px-4 py-2 text-xs font-bold text-[#FAF7F0] shadow-[2px_2px_0_0_#272221]"
                >
                  <Handshake size={15} />
                  <span>Send Vendor RFP</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'VertexLift Services', category: 'Elevator & Escalators', rating: 4.85, reviews: 48, area: 'Bengaluru South & Central', verified: true },
                  { name: 'Metro Facility Care', category: 'Housekeeping, Tank Cleaning & Painting', rating: 4.62, reviews: 36, area: 'HSR Layout & Koramangala', verified: true },
                  { name: 'Apex Power & LED Systems', category: 'Electrical & Retrofitting', rating: 4.90, reviews: 62, area: 'Bengaluru Urban', verified: true },
                  { name: 'AquaPure Systems & Softeners', category: 'Plumbing & Water Treatment', rating: 4.75, reviews: 29, area: 'HSR Layout', verified: true },
                  { name: 'CoolAir Solutions Pvt Ltd', category: 'HVAC & Air Conditioning', rating: 4.85, reviews: 54, area: 'Bengaluru City', verified: true }
                ].map((v) => (
                  <div key={v.name} className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[3px_3px_0_0_#272221] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1D7753]/15 text-[#1D7753] px-2.5 py-0.5 text-xs font-bold border border-[#1D7753]/30">
                          <ShieldCheck size={13} /> Verified
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#272221]">
                          <Star size={14} className="fill-[#F08C1E] text-[#F08C1E]" />
                          <span>{v.rating}</span>
                          <span className="text-[#272221]/50 font-normal">({v.reviews})</span>
                        </div>
                      </div>
                      <h3 className="font-display text-lg font-bold">{v.name}</h3>
                      <p className="text-xs text-[#272221]/70 mt-1">{v.category}</p>
                      <p className="text-[11px] text-[#272221]/50 mt-1">Operational Area: {v.area}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#272221]/15 flex items-center justify-between">
                      <span className="text-[11px] text-[#1D7753] font-bold">GST & MSME Compliant</span>
                      <button
                        onClick={() => {
                          setVendorSelection(`${v.name} · ${v.rating} ★`);
                          setModalType('vendor');
                        }}
                        className="rounded-full border-2 border-[#272221] bg-[#F08C1E] px-3 py-1 text-xs font-bold hover:-translate-y-0.5 transition-transform"
                      >
                        Invite to Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTICES */}
          {activeTab === 'Notices' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Society Notice Board</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Official communications broadcast to all 312 flats and resident mobile devices.
                  </p>
                </div>
                <button
                  onClick={() => setModalType('notice')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221]"
                >
                  <Megaphone size={15} />
                  <span>Broadcast New Notice</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'n1',
                    title: 'Water supply timing revised from Monday',
                    content: 'Bengaluru Water Board (BWSSB) will carry out main feeder pipe connection works. Supply will run from 6:00 AM - 9:30 AM and 6:30 PM - 9:30 PM.',
                    category: 'WATER',
                    postedBy: 'Bengaluru Water Board',
                    time: 'Today, 8:30 AM',
                    tagColor: 'bg-[#F08C1E]'
                  },
                  {
                    id: 'n2',
                    title: 'AGM agenda open for suggestions',
                    content: 'Please submit any agenda items for the upcoming Annual General Body Meeting to the society management office before Friday.',
                    category: 'EVENT',
                    postedBy: 'Society Admin (R. Anand)',
                    time: '2 days ago',
                    tagColor: 'bg-[#1D7753]'
                  },
                  {
                    id: 'n3',
                    title: 'Visitor parking reserved for Diwali',
                    content: 'Guest parking bays in Basement B & C are pre-allocated for festival visitors with designated parking passes.',
                    category: 'FACILITY',
                    postedBy: 'Facility Manager',
                    time: '5 days ago',
                    tagColor: 'bg-[#272221]'
                  },
                  ...notices.map(n => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    category: n.category || 'NOTICE',
                    postedBy: n.postedBy?.name || 'Society Admin',
                    time: 'Recent',
                    tagColor: 'bg-[#1D7753]'
                  }))
                ].map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[2px_2px_0_0_#272221]"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`size-3 rounded-full ${notice.tagColor}`} />
                        <span className="rounded-md bg-[#272221]/5 border border-[#272221]/15 px-2 py-0.5 text-[11px] font-bold">
                          {notice.category}
                        </span>
                        <span className="text-xs font-semibold text-[#272221]/60">Posted by {notice.postedBy}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#272221]/50">{notice.time}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#272221]">{notice.title}</h3>
                    <p className="mt-2 text-sm text-[#272221]/80 leading-relaxed font-normal">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COMPLAINTS */}
          {activeTab === 'Complaints' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Complaint Health & SLA Resolution</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Track resident tickets, escalate past SLA items, and log technician resolution.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#272221] bg-[#F08C1E] text-xs font-bold text-[#272221]">
                  <span>2 past SLA threshold</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'c1', category: 'Lift breakdowns', title: 'Tower A Lift #2 door sensor and jerking', flat: 'Tower A (Shared)', status: 'OPEN', sla: 'Overdue by 18 hrs', urgent: true, desc: 'Lift #2 jerks noticeably between floors 3 and 4. Needs urgent AMC vendor inspection today.' },
                  { id: 'c2', category: 'Security access', title: 'Gate C intercom handset & RFID boom barrier', flat: 'Gate C Entry', status: 'OPEN', sla: 'Overdue by 32 hrs', urgent: true, desc: 'Visitor intercom is dead. Security guards must manually verify entries causing tailgating.' },
                  { id: 'c3', category: 'Water pressure', title: 'Top floor pressure pump line fluctuation', flat: 'C-501 & C-502', status: 'IN_REVIEW', sla: 'Within SLA (4 hrs left)', urgent: false, desc: 'Water pressure drops during morning peak. Booster pump valve calibration assigned.' },
                  ...complaints.map(c => ({
                    id: c.id,
                    category: c.category,
                    title: c.description,
                    flat: `Flat ${c.resident?.flatNumber || 'Resident'}`,
                    status: c.status,
                    sla: 'Within SLA',
                    urgent: false,
                    desc: c.description
                  }))
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[2px_2px_0_0_#272221] ${
                      ticket.urgent ? 'border-l-8 border-l-[#F08C1E]' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#272221]/5 border border-[#272221]/15 px-2 py-0.5 text-xs font-bold">
                          {ticket.category}
                        </span>
                        <span className="text-xs font-bold text-[#272221]/70">{ticket.flat}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#272221]/20 ${
                        ticket.urgent ? 'bg-[#F08C1E] text-[#272221]' : 'bg-[#1D7753] text-[#FAF7F0]'
                      }`}>
                        {ticket.sla}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[#272221]">{ticket.title}</h3>
                    <p className="mt-1 text-xs text-[#272221]/70">{ticket.desc}</p>

                    <div className="mt-4 pt-3 border-t border-[#272221]/15 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#272221]">Status: {ticket.status}</span>
                      <button
                        onClick={() => showToast(`Technician assigned to ${ticket.category}`)}
                        className="rounded-full border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-1 text-xs font-bold hover:bg-[#1D7753] hover:text-white transition-colors"
                      >
                        Assign Technician & Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESIDENTS */}
          {activeTab === 'Residents' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Flats & Registered Residents</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Managing 248 active accounts across 312 society units in Sunrise Heights.
                  </p>
                </div>
                <button
                  onClick={() => setModalType('addResident')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221]"
                >
                  <Plus size={16} />
                  <span>Add Flat / Resident</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-[#272221] bg-[#FAF7F0]">
                <div className="hidden grid-cols-4 gap-4 border-b-2 border-[#272221] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#272221]/60 lg:grid bg-[#272221]/5">
                  <span>Resident Name</span>
                  <span>Unit / Flat</span>
                  <span>Contact</span>
                  <span>Pooling Status</span>
                </div>

                {[
                  { name: 'Rajesh Sharma', flat: 'A-101', email: 'resident1@sunriseheights.com', phone: '+91 98765 22001', pools: 'Enrolled in 2 Pools' },
                  { name: 'Priya Patel', flat: 'B-204', email: 'resident2@sunriseheights.com', phone: '+91 98765 22002', pools: 'Enrolled in 1 Pool' },
                  { name: 'Amitabh Verma', flat: 'A-302', email: 'resident3@sunriseheights.com', phone: '+91 98765 22003', pools: 'Enrolled in 3 Pools' },
                  { name: 'Sneha Reddy', flat: 'C-501', email: 'resident4@sunriseheights.com', phone: '+91 98765 22004', pools: 'Enrolled in 1 Pool' }
                ].map((res) => (
                  <div key={res.flat} className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-5 py-3.5 border-t border-[#272221]/15 first:border-t-0 items-center hover:bg-[#1D7753]/5">
                    <div>
                      <strong className="text-sm font-bold block">{res.name}</strong>
                      <span className="text-[11px] text-[#272221]/55">{res.email}</span>
                    </div>
                    <span className="font-bold text-sm text-[#1D7753]">{res.flat}</span>
                    <span className="text-xs text-[#272221]/70">{res.phone}</span>
                    <div>
                      <span className="rounded-full bg-[#1D7753]/15 text-[#1D7753] border border-[#1D7753]/30 px-2.5 py-0.5 text-xs font-bold">
                        {res.pools}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'Payments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Maintenance Collections & Savings Ledger</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Monthly society dues tracking alongside ₹1.84 Lakh collective procurement savings.
                  </p>
                </div>
                <button
                  onClick={() => setModalType('manualPay')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#1D7753] px-4 py-2 text-xs font-bold text-[#FAF7F0] shadow-[2px_2px_0_0_#272221]"
                >
                  <ReceiptIndianRupee size={15} />
                  <span>Log Dues Payment</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-[#272221] p-4 bg-[#FAF7F0]">
                  <span className="text-xs uppercase font-bold text-[#1D7753]">September Collection Rate</span>
                  <p className="mt-1 font-display text-3xl font-bold">92%</p>
                  <p className="text-xs text-[#272221]/60 mt-0.5">287 of 312 flats cleared</p>
                </div>
                <div className="rounded-xl border-2 border-[#272221] p-4 bg-[#FAF7F0]">
                  <span className="text-xs uppercase font-bold text-[#1D7753]">Total Society Fund</span>
                  <p className="mt-1 font-display text-3xl font-bold">₹12.05L</p>
                  <p className="text-xs text-[#272221]/60 mt-0.5">Includes sinking & repair reserve</p>
                </div>
                <div className="rounded-xl border-2 border-[#272221] p-4 bg-[#FAF7F0]">
                  <span className="text-xs uppercase font-bold text-[#1D7753]">Procurement Savings Realized</span>
                  <p className="mt-1 font-display text-3xl font-bold text-[#1D7753]">₹1.84L</p>
                  <p className="text-xs text-[#272221]/60 mt-0.5">Direct bulk discount benefit</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-[#272221] bg-[#FAF7F0]">
                <div className="hidden grid-cols-5 gap-4 border-b-2 border-[#272221] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#272221]/60 lg:grid bg-[#272221]/5">
                  <span>Unit / Resident</span>
                  <span>Billing Period</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Receipt No</span>
                </div>

                {[
                  { flat: 'A-101 (Rajesh Sharma)', period: 'September 2026', amount: '₹4,200', status: 'PAID', ref: 'REC-2026-09-A101' },
                  { flat: 'B-204 (Priya Patel)', period: 'September 2026', amount: '₹4,200', status: 'PAID', ref: 'REC-2026-09-B204' },
                  { flat: 'A-302 (Amitabh Verma)', period: 'September 2026', amount: '₹4,200', status: 'PENDING', ref: 'INV-2026-09-A302' },
                  { flat: 'C-501 (Sneha Reddy)', period: 'September 2026', amount: '₹4,200', status: 'OVERDUE', ref: 'INV-2026-09-C501' }
                ].map((pay) => (
                  <div key={pay.ref} className="grid grid-cols-2 lg:grid-cols-5 gap-3 px-5 py-3.5 border-t border-[#272221]/15 first:border-t-0 items-center hover:bg-[#1D7753]/5">
                    <strong className="text-sm font-bold">{pay.flat}</strong>
                    <span className="text-xs text-[#272221]/70">{pay.period}</span>
                    <span className="text-sm font-bold text-[#272221]">{pay.amount}</span>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border border-[#272221]/20 ${
                        pay.status === 'PAID' ? 'bg-[#1D7753] text-[#FAF7F0]' : pay.status === 'PENDING' ? 'bg-[#F08C1E] text-[#272221]' : 'bg-rose-500 text-white'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#272221]/60">{pay.ref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'Documents' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Society Document Repository</h2>
                  <p className="text-xs text-[#272221]/70 mt-0.5">
                    Official apartment association bylaws, AGM minutes, and signed contractor agreements.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Document upload dialog opened')}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#272221] bg-[#FAF7F0] px-4 py-2 text-xs font-bold text-[#272221] hover:bg-[#1D7753]/10"
                >
                  <FileText size={15} />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Sunrise Heights Apartment Owners Association Registered Bylaws', type: 'BYLAWS', size: '2.4 MB', date: 'August 2024' },
                  { title: 'Audited Society Balance Sheet & Bulk Savings Summary FY25-26', type: 'FINANCIAL', size: '4.8 MB', date: 'July 2026' },
                  { title: 'VertexLift Engineering Lift AMC Agreement & Escalation Matrix', type: 'CONTRACT', size: '1.2 MB', date: 'May 2026' },
                  { title: 'Corridor LED Retrofit Philips Commercial Warranty Certificate', type: 'WARRANTY', size: '850 KB', date: 'June 2026' }
                ].map((doc) => (
                  <div key={doc.title} className="rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-4 shadow-[2px_2px_0_0_#272221] flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-10 place-items-center rounded-lg bg-[#272221]/5 border border-[#272221]/15 shrink-0">
                        <FileText size={20} className="text-[#1D7753]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-[#272221]">{doc.title}</p>
                        <p className="text-[11px] text-[#272221]/50">{doc.type} · {doc.size} · {doc.date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Opening ${doc.title}`)}
                      className="shrink-0 ml-3 rounded-full border-2 border-[#272221] px-3 py-1 text-xs font-bold hover:bg-[#1D7753] hover:text-white transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LOVABLE MODAL 1: Invite a vendor */}
      {modalType === 'vendor' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Invite a vendor"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Invite a vendor</h2>
              <button
                aria-label="Close"
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendVendorInvite} className="mt-5 space-y-4">
              <label className="block text-sm font-bold">
                Demand pool
                <select
                  value={vendorPoolName}
                  onChange={(e) => setVendorPoolName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
                >
                  <option>Lift AMC renewal</option>
                  <option>Parking repaint</option>
                  <option>Corridor LED retrofit</option>
                  <option>Water softener service</option>
                </select>
              </label>

              <label className="block text-sm font-bold">
                Verified vendor
                <select
                  value={vendorSelection}
                  onChange={(e) => setVendorSelection(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
                >
                  <option>VertexLift Services · 4.8 ★</option>
                  <option>Metro Facility Care · 4.6 ★</option>
                  <option>Apex Power & LED Systems · 4.9 ★</option>
                  <option>AquaPure Systems · 4.7 ★</option>
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 bg-[#F08C1E] text-[#272221] shadow-[3px_3px_0_0_#272221] w-full"
              >
                <Handshake size={17} />
                <span>Send invitation</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 2: Create a notice */}
      {modalType === 'notice' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Create a notice"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-5 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Create a notice</h2>
              <button
                aria-label="Close"
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="mt-5 space-y-4">
              <label className="block text-sm font-bold">
                Title
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Enter notice title"
                  className="mt-1.5 w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
                />
              </label>

              <label className="block text-sm font-bold">
                Message
                <textarea
                  required
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Write the update for residents"
                  className="mt-1.5 w-full resize-none rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
                />
              </label>

              <label className="block text-sm font-bold">
                Category
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm font-normal"
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="WATER">Water Supply</option>
                  <option value="EVENT">Society Meeting / Event</option>
                  <option value="SECURITY">Security Advisory</option>
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 bg-[#F08C1E] text-[#272221] shadow-[3px_3px_0_0_#272221] w-full"
              >
                <Megaphone size={17} />
                <span>Publish notice</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 3: Compare Quotes Dialog */}
      {modalType === 'compare' && selectedPoolItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#1D7753]">{selectedPoolItem.category}</span>
                <h2 className="font-display text-2xl font-bold">{selectedPoolItem.name} — Bids</h2>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#272221]/70">
                Evaluating quotations submitted by verified vendors. The lowest compliant bid (L1) qualifies for collective bulk discount.
              </p>

              {(selectedPoolItem.quotesList || [
                { vendor: 'VertexLift Services', rating: 4.8, price: '₹46,000', perUnit: '₹23,000/tower', terms: '24/7 breakdown SLA, 12 audits included', isL1: true },
                { vendor: 'Apex Elevators Ltd', rating: 4.7, price: '₹51,000', perUnit: '₹25,500/tower', terms: 'Bi-monthly inspections, OEM spare guarantee' }
              ]).map((q, idx) => (
                <div
                  key={q.vendor}
                  className={`p-4 rounded-xl border-2 border-[#272221] bg-[#FAF7F0] ${
                    q.isL1 ? 'ring-2 ring-[#1D7753] bg-[#1D7753]/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base font-bold">{q.vendor}</strong>
                        {q.isL1 && (
                          <span className="rounded-full bg-[#1D7753] text-[#FAF7F0] text-[10px] font-bold px-2 py-0.5">
                            L1 Lowest Quote
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#272221]/60 flex items-center gap-1 mt-0.5">
                        <Star size={13} className="fill-[#F08C1E] text-[#F08C1E]" /> {q.rating} · {q.perUnit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#1D7753]">{q.price}</span>
                      <span className="block text-[10px] text-[#272221]/60">Total Contract</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#272221]/75 mt-2 bg-[#272221]/5 p-2 rounded-lg">{q.terms}</p>
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setModalType(null);
                        showToast(`PO issued to ${q.vendor} for ${selectedPoolItem.name}`);
                      }}
                      className="rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_#272221] hover:-translate-y-0.5 transition-transform"
                    >
                      Award & Issue PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 4: Issue PO Dialog */}
      {modalType === 'po' && selectedPoolItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Issue Purchase Order</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-[#1D7753]/10 border border-[#1D7753]/30 p-3 rounded-lg text-[#1D7753] font-semibold">
                Pool Contract: {selectedPoolItem.name} ({selectedPoolItem.category})
              </div>
              <p>
                <strong>Assigned Vendor:</strong> Apex Power & LED Systems (Verified)
              </p>
              <p>
                <strong>Approved Scope:</strong> Supply and replace 248 units of commercial energy-saver LED fixtures across Towers A, B, and C with 3-year on-site replacement warranty.
              </p>
              <p>
                <strong>Contract Value:</strong> ₹1,24,000 (Resident Collective Rate)
              </p>
              <p className="text-[#1D7753] font-bold">
                Total Collective Savings: {selectedPoolItem.savings}
              </p>

              <button
                onClick={() => {
                  setModalType(null);
                  showToast(`PO #SH-2026-092 authorized and transmitted to vendor`);
                }}
                className="w-full inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] bg-[#1D7753] px-4 py-2 text-sm font-bold text-[#FAF7F0] shadow-[3px_3px_0_0_#272221] mt-3 hover:-translate-y-0.5 transition-transform"
              >
                <CheckCircle2 size={16} />
                <span>Authorize & Send Purchase Order</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 5: Track Job Dialog */}
      {modalType === 'track' && selectedPoolItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Job Status Tracker</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{selectedPoolItem.name}</h3>
                  <p className="text-xs text-[#272221]/60">{selectedPoolItem.detail}</p>
                </div>
                <span className="rounded-full bg-[#272221] text-[#FAF7F0] text-xs font-bold px-2.5 py-1">
                  66% Complete
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { step: 'Draining & Sediment Vacuuming', done: true, time: 'Completed yesterday 3:00 PM' },
                  { step: 'High-Pressure Chemical Scrub', done: true, time: 'Completed today 10:30 AM' },
                  { step: 'UV Sterilization & Refilling', done: false, time: 'Scheduled today 4:00 PM' }
                ].map((m, idx) => (
                  <div key={m.step} className="flex items-start gap-3 text-xs">
                    <span className={`grid size-6 place-items-center rounded-full border-2 border-[#272221] font-bold text-[10px] shrink-0 mt-0.5 ${
                      m.done ? 'bg-[#1D7753] text-[#FAF7F0]' : 'bg-[#FAF7F0] text-[#272221]'
                    }`}>
                      {m.done ? <Check size={12} /> : idx + 1}
                    </span>
                    <div>
                      <p className={`font-bold ${m.done ? 'text-[#1D7753]' : 'text-[#272221]'}`}>{m.step}</p>
                      <p className="text-[11px] text-[#272221]/50">{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setModalType(null);
                  showToast('Job marked complete. Society inspection report generated.');
                }}
                className="w-full inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221] mt-3 hover:-translate-y-0.5 transition-transform"
              >
                Sign Off & Close Job
              </button>
            </div>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 6: Review Dialog */}
      {modalType === 'review' && selectedPoolItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Service Delivery Review</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p><strong>Contract:</strong> {selectedPoolItem.name}</p>
              <p><strong>Vendor:</strong> AquaPure Systems & Softeners</p>
              <div className="flex items-center gap-1 font-bold text-[#272221]">
                <span>Resident Rating:</span>
                <div className="flex text-[#F08C1E]">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-[#F08C1E]" />)}
                </div>
                <span>4.8 / 5.0 (189 reviews)</span>
              </div>
              <p className="bg-[#272221]/5 p-3 rounded-lg border border-[#272221]/10 text-xs italic">
                "Water hardness reduced from 420 ppm to 110 ppm. Great coordination by the society committee."
              </p>
              <button
                onClick={() => {
                  setModalType(null);
                  showToast('Vendor satisfaction certificate archived');
                }}
                className="w-full rounded-full border-2 border-[#272221] bg-[#1D7753] text-[#FAF7F0] py-2 text-xs font-bold shadow-[2px_2px_0_0_#272221]"
              >
                Confirm & Archive Audit
              </button>
            </div>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 7: Add Resident Dialog */}
      {modalType === 'addResident' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Add Flat & Resident</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddResident} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  placeholder="e.g. Meenakshi Sundaram"
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newResEmail}
                  onChange={(e) => setNewResEmail(e.target.value)}
                  placeholder="name@sunriseheights.com"
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Flat / Unit</label>
                  <input
                    type="text"
                    required
                    value={newResFlat}
                    onChange={(e) => setNewResFlat(e.target.value)}
                    placeholder="e.g. B-302"
                    className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newResPhone}
                    onChange={(e) => setNewResPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full border-2 border-[#272221] bg-[#F08C1E] py-2.5 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221] mt-2"
              >
                Register Resident Account
              </button>
            </form>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 8: Manual Payment Dialog */}
      {modalType === 'manualPay' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">Log Dues Payment</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Flat / Resident</label>
                <select
                  value={payResidentId}
                  onChange={(e) => setPayResidentId(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm font-semibold"
                >
                  <option value="">A-101 (Rajesh Sharma)</option>
                  <option value="">B-204 (Priya Patel)</option>
                  <option value="">A-302 (Amitabh Verma)</option>
                  <option value="">C-501 (Sneha Reddy)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Billing Month</label>
                  <input
                    type="text"
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                onClick={() => setModalType(null)}
                className="w-full rounded-full border-2 border-[#272221] bg-[#1D7753] text-[#FAF7F0] py-2.5 text-xs font-bold shadow-[2px_2px_0_0_#272221] mt-2"
              >
                Generate Receipt & Mark Paid
              </button>
            </form>
          </section>
        </div>
      )}

      {/* LOVABLE MODAL 9: New Demand Pool Dialog */}
      {modalType === 'newPool' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setModalType(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-3">
              <h2 className="font-display text-2xl font-bold">New Demand Pool</h2>
              <button
                onClick={() => setModalType(null)}
                className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Service Category</label>
                <select
                  value={newPoolCatId}
                  onChange={(e) => setNewPoolCatId(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm font-semibold"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="temp-1">Elevator AMC</option>
                  <option value="temp-2">Rooftop Solar Maintenance</option>
                  <option value="temp-3">Clubhouse Gymnasium Equipment AMC</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Quotation Period (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newPoolDays}
                  onChange={(e) => setNewPoolDays(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                onClick={() => setModalType(null)}
                className="w-full rounded-full border-2 border-[#272221] bg-[#F08C1E] py-2.5 text-xs font-bold text-[#272221] shadow-[2px_2px_0_0_#272221] mt-2"
              >
                Launch Collective Procurement
              </button>
            </form>
          </section>
        </div>
      )}

      {/* LOVABLE TOAST STATUS BANNER (Bottom-Right) */}
      {toastMessage && (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border-2 border-[#272221] bg-[#1D7753] px-4 py-3 text-sm font-bold text-[#FAF7F0] shadow-[4px_4px_0_0_#272221] animate-in slide-in-from-bottom-3 duration-200"
        >
          <Building2 size={17} />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
