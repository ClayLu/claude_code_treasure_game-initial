// Auth screen with Sign In / Sign Up tabs and a Guest mode button
// Input: none (reads auth state from useAuth)  Output: rendered auth form
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export default function AuthScreen() {
  const { login, signup, continueAsGuest } = useAuth();
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle sign-in form submission
  // Input: form submit event  Output: calls login() or sets error message
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await login(loginUsername, loginPassword);
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Handle sign-up form submission
  // Input: form submit event  Output: calls signup() or sets error message
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError('');
    setLoading(true);
    try {
      await signup(signupUsername, signupPassword);
    } catch (err) {
      setSignupError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-700">Sign in to save your scores, or play as a guest!</p>
      </div>

      <Card className="w-full max-w-sm border-2 border-amber-300 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-900 text-center">Welcome</CardTitle>
          <CardDescription className="text-center text-amber-700">Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In tab */}
            <TabsContent value="signin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {loginError}
                  </p>
                )}
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Choose a password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {signupError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {signupError}
                  </p>
                )}
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Separator */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-amber-200" />
            <span className="mx-3 text-sm text-amber-500">or</span>
            <div className="flex-1 border-t border-amber-200" />
          </div>

          {/* Guest mode button */}
          <Button
            variant="outline"
            className="w-full border-amber-400 text-amber-700 hover:bg-amber-50"
            onClick={continueAsGuest}
          >
            🎮 Play as Guest
          </Button>
          <p className="text-xs text-center text-amber-500 mt-2">Guest scores won't be saved</p>
        </CardContent>
      </Card>
    </div>
  );
}
