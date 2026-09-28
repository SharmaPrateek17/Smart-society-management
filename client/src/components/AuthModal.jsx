import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User, Mail, Sparkles, Building2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('RESIDENT');
  const [flatNumber, setFlatNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          flatNumber: role === 'RESIDENT' ? flatNumber : null,
          businessName: role === 'VENDOR' ? businessName : null,
          servicesOffered: role === 'VENDOR' ? servicesOffered : null
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#272221]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? 'Create Nivaas Account' : 'Sign In to Society Command'}
        className="w-full max-w-md rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-[#272221] relative animate-in fade-in duration-200"
      >
        <div className="flex items-center justify-between gap-4 border-b-2 border-[#272221]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#F08C1E] text-sm font-bold text-[#272221] border-2 border-[#272221]">
              N
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">
                {isRegister ? 'Join Nivaas OS' : 'Society Command'}
              </h2>
              <p className="text-[11px] font-semibold text-[#1D7753] uppercase tracking-wider">
                Sunrise Heights Platform
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            type="button"
            className="grid size-9 place-items-center rounded-full border-2 border-[#272221] hover:bg-[#272221]/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-100 border-2 border-rose-400 text-rose-900 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kulkarni"
                required
                className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@sunriseheights.com"
              required
              className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D7753]"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3 py-2 text-sm font-semibold focus:outline-none"
                >
                  <option value="RESIDENT">Resident (Flat Owner / Tenant)</option>
                  <option value="VENDOR">Service Vendor / Contractor</option>
                  <option value="ADMIN">Society Committee Admin</option>
                </select>
              </div>

              {role === 'RESIDENT' && (
                <div>
                  <label className="block text-xs font-bold mb-1">Flat / Unit Number</label>
                  <input
                    type="text"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    placeholder="e.g. A-304"
                    required
                    className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>
              )}

              {role === 'VENDOR' && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Elevators & Systems"
                      required
                      className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Services Offered</label>
                    <input
                      type="text"
                      value={servicesOffered}
                      onChange={(e) => setServicesOffered(e.target.value)}
                      placeholder="e.g. Elevator AMC, Electrical, Plumbing"
                      required
                      className="w-full rounded-lg border-2 border-[#272221] bg-[#FAF7F0] px-3.5 py-2.5 text-sm font-medium"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-4 py-2.5 text-sm font-bold text-[#272221] shadow-[3px_3px_0_0_#272221] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Complete Registration' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t-2 border-[#272221]/15 text-center text-xs">
          {isRegister ? (
            <span className="text-[#272221]/70 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-[#1D7753] hover:underline ml-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span className="text-[#272221]/70 font-medium">
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#1D7753] hover:underline ml-1"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
