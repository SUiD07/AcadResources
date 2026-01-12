import { useState } from 'react';
import { Mail, Lock, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginPageProps {
  onLogin: (isAdmin: boolean) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, isAdmin: isAdminLogin });
    // Mock login - no backend implementation
    onLogin(isAdminLogin);
  };

  const handleGoogleLogin = () => {
    console.log('Google login attempt', { isAdmin: isAdminLogin });
    // Mock Google login - no backend implementation
    onLogin(isAdminLogin);
  };

  const handleAdminLogin = () => {
    setIsAdminLogin(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Illustration */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E5007D] rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 tracking-tight">
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
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#E5007D] rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-slate-900 mb-2">
              Academic Resources Portal
            </h1>
            <p className="text-slate-600 text-sm">
              Faculty of Medicine, Chulalongkorn University
            </p>
          </div>

          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="space-y-2 text-center lg:text-left">
              <CardTitle className="text-slate-900">
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
                      placeholder="example@docchula.com"
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
                >
                  Sign In
                </Button>

                {!isAdminLogin && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 text-slate-600"
                    size="sm"
                    onClick={handleAdminLogin}
                  >
                    Admin Login
                  </Button>
                )}

                {isAdminLogin && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-600 hover:bg-slate-50"
                    size="sm"
                    onClick={() => setIsAdminLogin(false)}
                  >
                    ← Back to User Login
                  </Button>
                )}
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-300 hover:bg-slate-50"
                size="lg"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                Login with Google
                <span className="text-xs text-slate-500 ml-2">(docchula only)</span>
              </Button>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-center text-slate-600 leading-relaxed px-4">
              Provided by the Academic and IT Division, Student Union,<br />
              Faculty of Medicine, Chulalongkorn University
            </p>
            <div className="text-center">
              <p className="text-xs text-slate-500">
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