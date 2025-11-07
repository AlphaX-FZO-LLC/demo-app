'use client';

import { Card } from '@/components/ui/card';
import { LoginContext } from '@/lib/auth/types';

interface Props {
  onSelect: (method: 'webauthn' | 'digitalpass') => void;
  context: LoginContext;
}

export default function MethodSelector({ onSelect }: Omit<Props, 'context'>) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-2 bg-gradient-to-r from-black via-yellow-400 to-red-600 rounded-t-lg"></div>

      <Card className="border rounded-t-none p-4">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🇺🇬</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Digital Pass</h2>
        <p className="text-gray-600">Secure Digital Identity</p>
        
          <p className="text-sm text-blue-600 mt-3">
         Logging in to: <strong>Ministry of Internal Affairs</strong>
          </p>
   
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('webauthn')}
          className="w-full bg-black !cursor-pointer hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center space-x-2"
        >
          <span>🔐</span>
          <span>Sign In with Passkey</span>
        </button>
        
        <button
          onClick={() => onSelect('digitalpass')}
          className="w-full bg-gradient-to-r !cursor-pointer from-red-600 via-red-700 to-red-800  hover:to-red-900 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center space-x-2"
        >
          <span>📱</span>
          <span>Sign In with Digital Pass</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.history.back()}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back
        </button>
      </div>
    </Card>
    </div>
  );
}