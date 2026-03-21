'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'citizen';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        required
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full mb-6 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
        Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
      </button>
    </form>
  );
};

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Login</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-gray-600">
        Don't have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
