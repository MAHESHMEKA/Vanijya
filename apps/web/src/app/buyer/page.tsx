'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerRoute() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-xs font-bold text-amber-700">
        Loading Buyer Procurement Desk...
      </div>
    </div>
  );
}
