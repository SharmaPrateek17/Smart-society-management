import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Wrench,
  ChevronDown,
  LogOut,
  Sparkles,
  Layers,
  CheckCircle2,
  Bell
} from 'lucide-react';

export const Navbar = () => {
  const { user, demoAccounts, demoLogin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
        };
      case 'ADMIN':
        return {
          label: 'Society Admin',
          bg: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: <Building2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
        };
      case 'VENDOR':
        return {
          label: 'Service Vendor',
          bg: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <Wrench className="w-3.5 h-3.5 mr-1 text-amber-600" />
        };
      default:
        return {
          label: 'Resident',
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <Users className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
                  SmartNexus
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  Bulk Procurement
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Smart Society Management & Demand Aggregation
              </p>
            </div>
          </div>

          {/* Center / Society Indicator */}
          {user?.society && (
            <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>{user.society.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{user.society.city}</span>
              {user.flatNumber && (
                <span className="bg-white px-2 py-0.5 rounded shadow-2xs font-semibold text-sky-700 border border-slate-200">
                  Flat {user.flatNumber}
                </span>
              )}
            </div>
          )}

          {/* Right Action Controls: Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:bg-slate-700 shadow-sm transition-all"
                title="Switch between Resident, Admin, Vendor, or Super Admin instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">Switch Demo Persona</p>
                    <p className="text-[11px] text-slate-500">Test all 4 PRD roles with 1-click</p>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {demoAccounts.map((acc) => {
                      const isCurrent = user?.id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => demoLogin(acc.id)}
                          className={`w-full text-left px-3 py-2.5 flex items-start justify-between hover:bg-slate-50 transition-colors ${
                            isCurrent ? 'bg-sky-50/60 font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-medium text-slate-800">{acc.name}</span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {acc.flatNumber && <span className="text-slate-600">Flat {acc.flatNumber} • </span>}
                              {acc.businessName && <span className="text-amber-700 font-medium">{acc.businessName} • </span>}
                              <span>{acc.email}</span>
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                              acc.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-700'
                                : acc.role === 'VENDOR'
                                ? 'bg-amber-100 text-amber-700'
                                : acc.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Active Role Pill */}
            {badge && (
              <div
                className={`hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            )}

            {/* Current User Name */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {user.flatNumber ? `Flat ${user.flatNumber}` : user.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
