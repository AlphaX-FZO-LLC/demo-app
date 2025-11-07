'use client';

import { useState, useEffect, useRef } from 'react';
import { digitalPassAuth } from '@/lib/auth/digitalpass';
import { detectLoginContext, handleAuthSuccess } from '@/lib/auth/oauth';
import { SSEEvent } from '@/lib/auth/types';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Clock,
  Hourglass,
  Loader2,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';


export default function DigitalPassLogin() {
  const searchParams = useSearchParams();
  const context = detectLoginContext(searchParams);
  const [identifier, setIdentifier] = useState('');
  const [identifierType] = useState<'phoneNumber' | 'nationalId'>(
    'phoneNumber'
  );
  const [timeLeft, setTimeLeft] = useState(360) // 2 minutes
  const [isValidPhone] = useState(true);
  const [challengeNumber, setChallengeNumber] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState<'form' | 'challenge' | 'success' | 'error'>('challenge');
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

  const handleBackToForm = () => {
    setStatus('form');
    setError('');
    setChallengeNumber(null);
    setAccessToken('');
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
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
  <section className="min-h-screen bg-[#0C2B25] flex items-center justify-center p-4">
    <div className="container max-w-6xl mx-auto w-full space-y-6">
      <Card className="h-auto !border-0 !pb-8  !rounded-4xl" style={{ backgroundImage: 'url(/background-login.svg)' }}>
        <CardHeader className="border-b flex justify-between items-center">
          <div className='flex gap-2 items-center'>
                        <Image
                src="/app-icon.svg"
                alt="App Icon"
                width={42}
                height={42}
              />
            <div>
          <CardTitle>X Pass</CardTitle>
          <CardDescription>Secure Auth System</CardDescription>
            </div>
          </div>
          <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="text-red-600 w-[160px] !cursor-pointer !h-10 hover:text-red-700 border-red-700 border font-semibold rounded-full"
            >
              Cancel 
            </Button>

        </CardHeader>

        <CardContent className="flex flex-col lg:flex-row justify-between h-full px-8 !pb-0">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-3/4 pb-16">
                     <h1 className='text-[#333] mb-4 text-xl md:text-2xl font-semibold not-italic leading-normal tracking-normal'>
         Open your X Pass app &
select the number shown and confirm to login.
          </h1>
          <p className='mb-6 md:mb-10 text-black/50 text-sm md:text-base'>
       Login request from
          </p>
          <div className="w-full">
           {challengeNumber}
           <div className='flex gap-4'>
     <p className='text-[#D65D2F] flex gap-2 items-center'><Hourglass className='w-4 h-4' /> Waiting for your confirmation</p>
     <p className='text-black flex gap-2 items-center'><Clock className='w-4 h-4' /> Time Remaining : </p>
           </div>
      
          </div>
          </div>
          {/* RIGHT SIDE */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm md:max-w-lg h-auto">
              <Image
                src="/right-single-phone.svg"
                alt="Phone"
                width={600}
                height={600}
                className="w-full h-[378px] object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
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

  <section className="min-h-screen bg-[#0C2B25] flex items-center justify-center p-4">
    <div className="container max-w-6xl mx-auto w-full space-y-6">
      <Card className="h-auto !border-0 !pb-0  !rounded-4xl" style={{ backgroundImage: 'url(/background-login.svg)' }}>
        <CardHeader className="border-b flex gap-2 items-center">
            <Image
                src="/app-icon.svg"
                alt="App Icon"
                width={42}
                height={42}
              />
            <div>
          <CardTitle>X Pass</CardTitle>
          <CardDescription>Secure Auth System</CardDescription>
            </div>
        </CardHeader>

        <CardContent className="flex flex-col lg:flex-row justify-between h-full px-8 !pb-0">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-3/4 pb-16">
                     <h1 className='text-[#333] mb-4 text-xl md:text-2xl font-semibold not-italic leading-normal tracking-normal'>
            Login to your account
          </h1>
          <p className='mb-6 md:mb-10 text-black/50 text-sm md:text-base'>
            To proceed, please tap the button below to securely access your X Pass.
            Your privacy and security are our top priorities.
          </p>
          <div className="w-full ">
            <div className='relative'>
           <Input
              value={identifier}
              required
              disabled={loading}
              type="text"
              placeholder="Enter registered mobile number"
              onChange={(e) => setIdentifier(e.target.value)}
              className={`!h-[72px] !pl-6 text-lg !bg-gray-100 !rounded-full !shadow-none !border-0 mb-4 transition-colors ${
                !isValidPhone && identifier.length > 0
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "focus:border-yellow-400 focus:ring-yellow-400"
              }`}
              autoComplete="tel"
              inputMode="numeric"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit}
              disabled={!identifier.trim() || !isValidPhone || loading}
              className="!max-w-[160px] disabled:cursor-not-allowed absolute right-2 bottom-2 !h-14 !w-[160px]  !bg-yellow-600 dark:bg-gray-700 cursor-pointer text-white dark:text-gray-200 rounded-full font-normal"
            >       
            {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                 Proceed
                </>
              )}
            </Button>
                </div>
          </div>
                 {!isValidPhone && identifier.length > 0 && (
                <p className="text-sm text-red-600 text-center mt-2">Please enter a valid Uganda phone number</p>
              )}

      {error && (
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError('')}
        />
      )}
          <p className='mt-4 md:mt-6 text-sm md:text-base'>
            Don’t have an account? <span className='text-yellow-600 border-b border-yellow-600'>Sign Up Now</span>
          </p>
          <p className='mt-8 border-b md:mt-20 inline-block border-black text-sm md:text-base'>
            How to use X Pass app to login?
          </p>
          <div className='flex flex-row gap-4 mt-6'>
              <Image
                src="/google-play.svg"
                alt="Google Play"
                width={138}
                height={54}
              />
             <Image
                src="/app-store.svg"
                alt="App Store"
                width={138}
                height={54}
              />
          </div>
          </div>
          {/* RIGHT SIDE */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm md:max-w-2xl h-auto">
              <Image
                src="/phone-image.svg"
                alt="Phone"
                width={643}
                height={620}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>

  );
}







           
{/*       
                              {challengeNumber}
                            <Button
              variant="ghost"
              onClick={onBack}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
            >
              Cancel Request <X className="w-4 h-4 ml-1" />
            </Button>
          <span className="text-sm font-medium"> {attemptsRemaining !== null && ` ${attemptsRemaining} attempts remaining`}</span> */}