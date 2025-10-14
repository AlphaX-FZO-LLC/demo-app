'use client';

import { useState, useEffect, useRef } from 'react';
import { digitalPassAuth } from '@/lib/auth/digitalpass';
import { handleAuthSuccess, LoginContext } from '@/lib/auth/oauth';
import { SSEEvent } from '@/lib/auth/types';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '../ui/card';
import {
  CheckCircle,
  Clock,
  Fingerprint,
  Loader2,
  Phone,
  X,
} from 'lucide-react';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Checkbox } from '@radix-ui/react-checkbox';
import { Label } from '@radix-ui/react-label';

interface Props {
  context: LoginContext;
  onBack?: () => void;
}

export default function DigitalPassLogin({ context, onBack }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'phoneNumber' | 'nationalId'>(
    'phoneNumber'
  );
  const [timeLeft, setTimeLeft] = useState(360) // 2 minutes
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [challengeNumber, setChallengeNumber] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState<'form' | 'challenge' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [timeLeft])

  const getProgressPercentage = () => {
    return ((120 - timeLeft) / 120) * 100
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (context.type === 'oauth2') {
        if (!context.partnerSessionId) {
          throw new Error('Missing partner session ID for OAuth2 flow');
        }

        result = await digitalPassAuth.initiateSSOChallenge({
          partner_session_id: context.partnerSessionId,
          identifier,
          identifier_type: identifierType,
        });
      } else {
        result = await digitalPassAuth.initiateChallenge({
          identifier,
          identifier_type: identifierType,
        });
      }

      setChallengeNumber(result.challenge_number);
      setAccessToken(result.access_token);
      setStatus('challenge');


      startSSEMonitoring(result.access_token, context.type === 'oauth2');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      let errorMessage =
        error.response?.data?.message || error.message || 'Failed to initiate challenge';

      if (errorMessage.includes('No identity found')) {
        errorMessage =
          'Phone number not registered with Uganda Pass. Please register your identity first or use a different number.';
      } else if (errorMessage.includes('No device token')) {
        errorMessage =
          'Device not registered for Uganda Pass. Please register your device first.';
      } else if (errorMessage.includes('Rate limit')) {
        errorMessage = 'Too many attempts. Please wait and try again later.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startSSEMonitoring = (accessToken: string, isSSO: boolean) => {
    try {
      const eventSource = digitalPassAuth.setupSSEStream(accessToken, isSSO);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'status':
            setAttemptsRemaining(data.attemptsRemaining || null);
            if (data.status === 'verified') {
              setStatus('success');
            } else if (data.status === 'failed' || data.status === 'expired') {
              setStatus('error');
              setError('Authentication failed or expired');
            }
            break;

          case 'redirect':
            eventSource.close();
            window.location.href = data.redirect_uri!;
            break;

          case 'tokens':
            eventSource.close();
            handleAuthSuccess(context, {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
            });
            break;

          case 'error':
            eventSource.close();
            setStatus('error');
            setError(data.message || 'Authentication failed');
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        startPolling(accessToken, isSSO);
      };
    } catch (error) {
      console.error('Failed to setup SSE:', error);
      startPolling(accessToken, isSSO);
    }
  };

  const startPolling = (accessToken: string, isSSO: boolean) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await digitalPassAuth.getSessionStatus(accessToken);
        setAttemptsRemaining(status.attemptsRemaining);

        if (status.status === 'verified') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          if (isSSO) {
            setStatus('success');
          } else {
            window.location.href = '/dashboard';
          }
        } else if (['failed', 'expired'].includes(status.status)) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setStatus('error');
          setError('Authentication failed or expired');
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setStatus('error');
        setError('Connection lost');
      }
    }, 3000);
  };

  if (status === 'challenge') {
    return (
      <div className="bg-gray-50 flex flex-col rounded-lg">
        <div className="h-1 bg-gradient-to-r from-black via-yellow-400 to-red-600"></div>
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <Fingerprint className="w-6 h-6 text-black" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border border-white"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Approve Login Request</h1>
                {attemptsRemaining !== null && ` (${attemptsRemaining} attempts remaining)`}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
            >
              Cancel Request <X className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center py-8 justify-center px-4 ">
          <div className="w-full max-w-4xl mx-auto">
            <Card className="shadow-lg flex">
              <CardContent className="p-8">
                {/* Challenge content */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-red-50 rounded-lg border border-yellow-200">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-full"></div>
                        <Fingerprint className="w-8 h-8 text-black relative z-10" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Secure Digital Identity</p>
                        <p className="text-xs text-gray-500">Digital • Secure</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Login request from</h3>
                        <p className="text-lg font-bold text-gray-900">Ministry of Internal Affairs</p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-lg p-6 border border-yellow-200">
                        <p className="text-lg text-gray-800 mb-4 text-balance font-medium">
                          Open your Pass app, select the number shown and confirm to login
                        </p>

                        <div className="flex items-center justify-center mb-4">
                          <div className="relative bg-white rounded-lg border-4 border-yellow-400 px-8 py-6 shadow-lg">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-yellow-400 to-red-600 rounded-t"></div>
                            <span className="text-6xl font-bold text-gray-900 font-mono">
                              {challengeNumber}
                            </span>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-black rounded-b"></div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all duration-1000"   style={{ width: `${getProgressPercentage()}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-orange-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-semibold">Waiting for your confirmation</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium"> {attemptsRemaining !== null && ` ${attemptsRemaining} attempts remaining`}</span>
                        </div>
                      </div>
                  </div>

                  {/* Right Section (Mock Phone) */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-64 h-80 bg-gradient-to-b from-gray-200 to-gray-300 rounded-3xl border-8 border-gray-400 flex items-center justify-center relative overflow-hidden shadow-xl">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-500 rounded-full"></div>
                        <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-yellow-400 to-red-600"></div>
                          <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
                            <Fingerprint className="w-8 h-8 text-black" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border border-white"></div>
                          </div>
                          <p className="text-xs text-gray-600 text-center mb-4 font-bold">Pass</p>
                          <div className="w-full space-y-2">
                            <div className="h-2 bg-gray-300 rounded"></div>
                            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                          </div>
                          <div className="mt-6 w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-yellow-500">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-red-600 animate-pulse">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center min-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-black mb-2">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting...</p>
        <LoadingSpinner className="h-6 w-6 mx-auto mt-4" />
      </div>
    );
  }

  return (
    <>
     <div className="w-full max-w-md mx-auto">
      <div className="h-2 bg-gradient-to-r from-black via-yellow-400 to-red-600 rounded-t-lg"></div>
      <Card className="shadow-lg rounded-t-none">
        <CardContent className="px-8">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full mb-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent rounded-full"></div>
              <Fingerprint className="w-10 h-10 text-black relative z-10" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full border-2 border-white"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login to Pass</h1>
            <p className="text-sm text-gray-600 font-medium">Digital Identity System</p>
              {context.type === 'oauth2' && (
          <p className="text-sm text-blue-600 mt-2">
            Logging in to: <strong>Ministry of Internal Affairs</strong>
          </p>
        )}
            <p className="text-xs text-gray-500 mt-1">Digital • Secure • Trusted</p>
          </div>

      {error && (
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError('')}
        />
      )}

          <div className="space-y-6">
            <div className="space-y-4">
                <Label  htmlFor="identifier" className="font-medium text-gray-700">
                  🇺🇬 Phone Number or National ID
                </Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
              
            value={identifier}
            required
            disabled={loading}
                  type="text"
                  placeholder="e.g., +256700000000 or NIN123456789"
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={`h-12 pl-10 text-center text-lg border-2 transition-colors ${
                    !isValidPhone && identifier.length > 0
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-yellow-400 focus:ring-yellow-400"
                  }`}
                  autoComplete="tel"
                  inputMode="numeric"
         
                />
              </div>
              {!isValidPhone && identifier.length > 0 && (
                <p className="text-sm text-red-600 text-center">Please enter a valid Uganda phone number</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border rounded-sm w-4 h-4 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer font-medium">
                Remember me
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full  rounded-full h-12 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!identifier.trim() || !isValidPhone || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
               <span>📱</span>
                Login with Digital Pass
                </>
              )}
            </Button>

                  {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm !cursor-pointer"
            disabled={loading}
          >
            ← Choose Different Method
          </button>
        </div>
      )}

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Dont have Pass account?{" "}
                <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold">
                  Create new account
                </Link>
              </p>
              <Link href="/recover" className="text-red-600 hover:text-red-700 text-sm font-semibold block">
                Recover your account
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 italic">&quot;Pass 2025&quot;</p>
      </div>
    </div>
       </>
  );
}