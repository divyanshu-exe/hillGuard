import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Ban, CheckCircle2 } from 'lucide-react';
import { RiskStatus, RoadPassability } from '../../types';

interface StatusBadgeProps {
  type: 'risk' | 'passability';
  value: RiskStatus | RoadPassability | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }[size];

  if (type === 'risk') {
    switch (value) {
      case 'GREEN':
      case 'SAFE':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            SAFE
          </span>
        );
      case 'YELLOW':
      case 'LANDSLIDE_RISK':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            LANDSLIDE RISK
          </span>
        );
      case 'RED':
      case 'CRITICAL_RISK':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-red-50 text-red-700 border border-red-200 radar-pulse-danger ${sizeClasses}`}>
            <AlertOctagon className="w-4 h-4 text-red-600" />
            CRITICAL RISK
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  // Passability Badge
  switch (value) {
    case 'OPEN':
      return (
        <span className={`inline-flex items-center font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          OPEN (ALL LANES)
        </span>
      );
    case 'ONE_WAY_CAUTION':
      return (
        <span className={`inline-flex items-center font-semibold rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 ${sizeClasses}`}>
          <AlertTriangle className="w-4 h-4 text-yellow-700" />
          ONE-WAY / CAUTION
        </span>
      );
    case 'RESTRICTED_CONVOY':
      return (
        <span className={`inline-flex items-center font-semibold rounded-md bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses}`}>
          <AlertTriangle className="w-4 h-4 text-orange-700" />
          RESTRICTED CONVOY
        </span>
      );
    case 'BLOCKED':
      return (
        <span className={`inline-flex items-center font-bold rounded-md bg-red-600 text-white shadow-sm ${sizeClasses}`}>
          <Ban className="w-4 h-4" />
          ROAD BLOCKED
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border ${sizeClasses}`}>
          {value}
        </span>
      );
  }
};
