'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CONFIG } from '@/lib/config'
import { generatePKCEChallenge, storePKCEVerifier, retrievePKCEVerifier, clearPKCEVerifier } from '@/lib/pkce'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams?.get('code')
    const state = searchParams?.get('state')

    if (code && state) {
      const storedState = sessionStorage.getItem('oauth_state')
      if (state !== storedState) {
        console.log({ message: 'Invalid state parameter - possible CSRF attack', type: 'error' })
        return
      }

      console.log({ message: 'Authentication successful! Exchanging code for tokens...', type: 'success' })
      exchangeCodeForTokens(code)
    }
  }, [searchParams])

  const generateState = (): string => {
    return btoa(Math.random().toString(36).substring(2, 11))
  }

  const loginWithDigitalPass = async () => {
    const state = generateState()
    
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('auth_method', 'digital_pass')
    
    console.log({ message: 'Preparing secure authentication...', type: 'info' })
    
    const authUrl = new URL(`${CONFIG.AUTH_SERVER_URL}/auth/authorize`)
    if (!CONFIG.CLIENT_ID || !CONFIG.CALLBACK_URL || !CONFIG.SCOPES) {
      console.log({ message: 'Missing OAuth configuration. Please check environment variables.', type: 'error' })
      return
    }
    
    // Add standard OAuth2 parameters
    authUrl.searchParams.append('client_id', CONFIG.CLIENT_ID ?? '')
    authUrl.searchParams.append('redirect_uri', CONFIG.CALLBACK_URL ?? '')
    authUrl.searchParams.append('scope', CONFIG.SCOPES ?? '')
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('channel', 'web')
    
    // Add PKCE parameters if enabled
    if (CONFIG.USE_PKCE) {
      try {
        const pkceParams = await generatePKCEChallenge()
        
        // Store code verifier securely for token exchange
        storePKCEVerifier(pkceParams.codeVerifier)
        
        // Add PKCE parameters to authorization request
        authUrl.searchParams.append('code_challenge', pkceParams.codeChallenge)
        authUrl.searchParams.append('code_challenge_method', pkceParams.codeChallengeMethod)
        
        console.log({ message: 'Redirecting to Digital Pass authentication (PKCE-secured)...', type: 'info' })
      } catch (error) {
        console.error('PKCE generation failed:', error)
        console.log({ message: 'Failed to generate PKCE parameters. Please try again.', type: 'error' })
        return
      }
    } else {
      console.log({ message: 'Redirecting to Digital Pass authentication...', type: 'info' })
    }
    
    setTimeout(() => {
      window.location.href = authUrl.toString()
    }, 1000)
  }

  const exchangeCodeForTokens = async (code: string) => {
    try {
      // Prepare token request body
      const tokenRequest: any = {
        grant_type: 'authorization_code',
        code: code,
        client_id: CONFIG.CLIENT_ID,
        redirect_uri: CONFIG.CALLBACK_URL
      }
      
      // Add PKCE verifier if PKCE is enabled
      if (CONFIG.USE_PKCE) {
        const codeVerifier = retrievePKCEVerifier()
        if (!codeVerifier) {
          throw new Error('PKCE code verifier not found. Authentication flow may be compromised.')
        }
        tokenRequest.code_verifier = codeVerifier
        
        // Clear the verifier after use (single-use security)
        clearPKCEVerifier()
      } else {
        // For confidential clients, include client secret
        tokenRequest.client_secret = CONFIG.CLIENT_SECRET
      }
      
      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenRequest)
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const tokens = await response.json()
      
      sessionStorage.setItem('access_token', tokens.access_token)
      if (tokens.refresh_token) {
        sessionStorage.setItem('refresh_token', tokens.refresh_token)
      }

      console.log({ message: 'Tokens received successfully! Redirecting to dashboard...', type: 'success' })

      setTimeout(() => {
        router.push('/en/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Token exchange error:', error)
      console.log({ message: `Token exchange failed: ${error.message}`, type: 'error' })
    }
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
               <div className="w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={loginWithDigitalPass}
              className="w-full sm:w-[240px] !h-10 !bg-yellow-600 dark:bg-gray-700 cursor-pointer text-white dark:text-gray-200 rounded-full font-normal"
            >
              Sign in with X Pass
            </Button>
          </div>
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
  )
}