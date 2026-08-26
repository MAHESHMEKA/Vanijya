'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoute() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-xs font-bold text-amber-700">
        Loading Administration & Impact Dashboard...
      </div>
    </div>
  );
}
