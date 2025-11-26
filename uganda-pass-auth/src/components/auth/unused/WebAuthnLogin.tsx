'use client';

import { useState } from 'react';
import { webauthnAuth } from '@/lib/auth/webauthn';
import { handleAuthSuccess, LoginContext } from '@/lib/auth/oauth';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  context: LoginContext;
  onBack?: () => void;
}

export default function WebAuthnLogin({ context, onBack }: Props) {
  const [entityId, setEntityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await webauthnAuth.authenticate(entityId);
      handleAuthSuccess(context, result);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='min-w-md'>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pass</h2>
        <p className="text-gray-600">Secure Authentication with Passkey</p>
        {context.type === 'oauth2' && (
          <p className="text-sm text-blue-600 mt-2">
           Logging in to: <strong>Ministry of Internal Affairs</strong>
          </p>
        )}
      </div>

      {error && (
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity ID
          </label>
          <input
            type="text"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Enter your entity ID"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !entityId}
          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>🔐</span>
              <span>Sign In with Passkey</span>
            </>
          )}
        </button>
      </form>

      {onBack && (
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={loading}
          >
            ← Choose Different Method
          </button>
        </div>
      )}
    </div>
    </main>
  );
}