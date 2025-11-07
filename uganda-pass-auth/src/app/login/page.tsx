'use client';
import { Suspense } from 'react';
import DigitalPassLogin from '@/components/auth/DigitalPassLogin';

function LoginPageContent() {
  return <DigitalPassLogin />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}