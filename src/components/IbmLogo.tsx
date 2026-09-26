import React from 'react';

interface IbmSymbolProps {
  className?: string;
}

/**
 * Authentic IBM 8-bar logo mark
 */
export const IbmSymbol: React.FC<IbmSymbolProps> = ({ className = 'w-4 h-3.5 text-[#0f62fe]' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 36 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="IBM"
    >
      {/* Stripe 1 */}
      <rect x="0" y="0" width="8" height="1.3" rx="0.2" />
      <rect x="10" y="0" width="9.5" height="1.3" rx="0.2" />
      <rect x="21" y="0" width="4" height="1.3" rx="0.2" />
      <rect x="31" y="0" width="4" height="1.3" rx="0.2" />

      {/* Stripe 2 */}
      <rect x="0" y="2.1" width="8" height="1.3" rx="0.2" />
      <rect x="10" y="2.1" width="11" height="1.3" rx="0.2" />
      <rect x="21" y="2.1" width="4.5" height="1.3" rx="0.2" />
      <rect x="30.5" y="2.1" width="4.5" height="1.3" rx="0.2" />

      {/* Stripe 3 */}
      <rect x="2.5" y="4.2" width="3" height="1.3" rx="0.2" />
      <rect x="10" y="4.2" width="11.5" height="1.3" rx="0.2" />
      <rect x="21" y="4.2" width="5.5" height="1.3" rx="0.2" />
      <rect x="29.5" y="4.2" width="5.5" height="1.3" rx="0.2" />

      {/* Stripe 4 */}
      <rect x="2.5" y="6.3" width="3" height="1.3" rx="0.2" />
      <rect x="10" y="6.3" width="10" height="1.3" rx="0.2" />
      <rect x="21" y="6.3" width="14" height="1.3" rx="0.2" />

      {/* Stripe 5 */}
      <rect x="2.5" y="8.4" width="3" height="1.3" rx="0.2" />
      <rect x="10" y="8.4" width="11.5" height="1.3" rx="0.2" />
      <rect x="21" y="8.4" width="5.5" height="1.3" rx="0.2" />
      <rect x="29.5" y="8.4" width="5.5" height="1.3" rx="0.2" />

      {/* Stripe 6 */}
      <rect x="2.5" y="10.5" width="3" height="1.3" rx="0.2" />
      <rect x="10" y="10.5" width="11" height="1.3" rx="0.2" />
      <rect x="21" y="10.5" width="4.5" height="1.3" rx="0.2" />
      <rect x="30.5" y="10.5" width="4.5" height="1.3" rx="0.2" />

      {/* Stripe 7 */}
      <rect x="0" y="12.6" width="8" height="1.3" rx="0.2" />
      <rect x="10" y="12.6" width="10" height="1.3" rx="0.2" />
      <rect x="21" y="12.6" width="4" height="1.3" rx="0.2" />
      <rect x="31" y="12.6" width="4" height="1.3" rx="0.2" />

      {/* Stripe 8 */}
      <rect x="0" y="14.7" width="8" height="1.3" rx="0.2" />
      <rect x="10" y="14.7" width="9.5" height="1.3" rx="0.2" />
      <rect x="21" y="14.7" width="3.5" height="1.3" rx="0.2" />
      <rect x="31.5" y="14.7" width="3.5" height="1.3" rx="0.2" />
    </svg>
  );
};

export const IbmBobBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50/90 border border-blue-200/90 font-mono font-bold text-[#0f62fe] shadow-2xs select-none ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
      <IbmSymbol className="w-4 h-3 text-[#0f62fe] shrink-0" />
      <span>IBM BOB</span>
    </div>
  );
};
