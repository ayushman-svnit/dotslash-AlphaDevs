'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'citizen';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${fullName}|${role.toUpperCase()}`
      });
      router.push(`/login?role=${role}&message=Account created successfully`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <input 
        type="text" 
        placeholder="Full Name" 
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="block w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        required
      />
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
      <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
        Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
      </button>
    </form>
  );
};

const SignupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Sign Up</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <SignupForm />
      </Suspense>
      <p className="mt-6 text-gray-600">
        Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default SignupPage;
