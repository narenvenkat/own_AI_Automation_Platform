import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore.js';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide text-slate-400">Authenticating Operator Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-300">
        <div className="p-8 glass-panel rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-6">Your operator role does not have authorization for this console section.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
