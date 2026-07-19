import { useState, useEffect } from 'react';
import { Mail, Lock, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import * as googleDrive from '../lib/googleDriveService';

interface LoginPageProps {
  onLogin: (isAdmin: boolean, email?: string) => void;
  initialAdminMode?: boolean;
}

export function LoginPage({ onLogin, initialAdminMode = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(initialAdminMode);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialAdminMode) {
      setIsAdminLogin(true);
    }
  }, [initialAdminMode]);

  useEffect(() => {
    const restored = googleDrive.restoreAccessToken();
    if (restored) {
      // สามารถอัป verify ได้ทันที
      console.log("Token restored from session");
    }
    // Wait for the Google script to load before initializing
    const checkGoogle = setInterval(() => {
      if ((window as any).google) {
        clearInterval(checkGoogle);
        // Initialize Google GIS client
        googleDrive.initTokenClient(async (token) => {
          try {
            setIsVerifying(true);
            setError(null);

            // 1. Verify email domain is @docchula.com
            const userInfo = await googleDrive.getUserInfo();
            if (!userInfo.email.endsWith('@docchula.com')) {
              setError('Access Denied: Please sign in with your @docchula.com account.');
              setIsVerifying(false);
              return;
            }

            // 2. Verify folder access
            const hasAccess = await googleDrive.checkDriveAccess();

            if (hasAccess) {
              // Automatically grant admin if email is admin@docchula.com
              const isActuallyAdmin = isAdminLogin || userInfo.email === 'admin@docchula.com';
              onLogin(isActuallyAdmin, userInfo.email);
            } else {
              setError('Access Denied: Your @docchula.com account does not have permission to access the required Drive folder.');
            }
          } catch (err: any) {
            setError(err.message || 'Failed to verify access.');
          } finally {
            setIsVerifying(false);
          }
        });
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, [isAdminLogin, onLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin login only (email + password)
    if (email === "admin@docchula.com") {
      if (password === "admin") {
        onLogin(true, email);
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }
    setError("Please use the admin account.");
  };

  const handleGoogleLogin = () => {
    googleDrive.requestToken();
  };

  const handleAdminLogin = () => {
    setIsAdminLogin(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center p-4 py-8 sm:py-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Illustration */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E5007D] rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 tracking-tight text-2xl xl:text-3xl">
                  Academic Resources Portal
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Faculty of Medicine, Chulalongkorn University
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop"
              alt="Medical students studying"
              className="rounded-2xl shadow-2xl w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#E5007D]/10 to-transparent rounded-2xl" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-slate-200">
            <p className="text-slate-700 text-sm leading-relaxed">
              Access peer-created study materials, academic activities, and essential resources
              curated by your fellow medical students and faculty.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 sm:mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#E5007D] rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <h1 className="text-slate-900 mb-2 text-xl sm:text-2xl px-2">
              Academic Resources Portal
            </h1>
            <p className="text-slate-600 text-sm px-2">
              Faculty of Medicine, Chulalongkorn University
            </p>
          </div>

          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="space-y-2 text-center lg:text-left">
              <CardTitle className="text-slate-900 text-lg sm:text-xl">
                {isAdminLogin ? 'Admin Sign In' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isAdminLogin
                  ? 'Admin Sign In (docchula account)'
                  : 'Sign in with your docchula account to access academic resources'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="break-words">{error}</AlertDescription>
                </Alert>
              )}

              {isAdminLogin ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@docchula.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-[#E5007D] focus:ring-[#E5007D]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-[#E5007D] focus:ring-[#E5007D]"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E5007D] hover:bg-[#c00069] text-white"
                    size="lg"
                    disabled={isVerifying}
                  >
                    Sign In as Admin
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-600 hover:bg-slate-50"
                    size="sm"
                    onClick={() => {
                      setIsAdminLogin(false);
                      setError(null);
                    }}
                    disabled={isVerifying}
                  >
                    ← Back to User Login
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 h-auto min-h-10 py-2.5"
                    size="lg"
                    onClick={handleGoogleLogin}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-center">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Login with Google</span>
                        <span className="text-xs text-slate-500">
                          (docchula only)
                        </span>
                      </span>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#E5007D] hover:bg-[#c00069] text-white"
                    size="sm"
                    onClick={handleAdminLogin}
                    disabled={isVerifying}
                  >
                    Admin Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-center text-slate-600 leading-relaxed px-4">
              Provided by the Academic and IT Division, Student Union,<br />
              Faculty of Medicine, Chulalongkorn University
            </p>
            <div className="text-center">
              <p className="text-xs text-slate-500 break-words px-2">
                Having trouble logging in?{' '}
                <a
                  href="mailto:it@docchula.com"
                  className="text-[#E5007D] hover:underline"
                >
                  Contact us at: it@docchula.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}