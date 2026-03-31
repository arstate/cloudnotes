'use client';

import { useEffect, useState } from 'react';
import { auth, signInWithGoogle } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Auth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain ini belum diizinkan. Tambahkan domain Vercel Anda ke 'Authorized domains' di Firebase Console (Authentication > Settings).");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Popup login ditutup sebelum selesai.");
      } else {
        setError(err.message || "Terjadi kesalahan saat login.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F4]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F5F5F4]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2C94C] shadow-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Notes</h1>
          <p className="mb-6 text-sm text-gray-500">Sign in to sync your notes across devices.</p>
          
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSignIn} 
            className="w-full bg-[#F2C94C] text-black hover:bg-[#E2B93C]"
            size="lg"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
