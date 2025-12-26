
import React, { useState, useEffect, createContext, useContext, useReducer } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, User as UserIcon, LogOut, Bell, Search, Activity, Lock, Globe, Key } from 'lucide-react';
import { User, AuthState, AuthAction } from './types.ts';
import { Button, Input, Card, CardHeader, CardContent, CardFooter } from './components/UI.tsx';
import { getSecurityInsight } from './services/geminiService.ts';
import { cn } from './utils/cn.ts';

// --- Auth Context ---
interface AuthContextType extends AuthState {
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START': return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS': return { ...state, isLoading: false, isAuthenticated: true, user: action.payload };
    case 'LOGIN_FAILURE': return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT': return { ...state, isAuthenticated: false, user: null };
    default: return state;
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(savedUser) });
      } catch {
        localStorage.removeItem('auth_user');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email: string, name: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        email, 
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      localStorage.setItem('auth_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed. Please try again.' });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Pages ---

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, email.split('@')[0]);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-50">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl border-white">
        <CardHeader 
          title="SecureAuth AI" 
          subtitle="Precision-engineered security for your digital life" 
          icon={<Shield className="text-slate-900" size={32} />}
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email address" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="font-medium text-slate-900 hover:underline">Forgot password?</a>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button className="w-full" type="submit" isLoading={isLoading}>
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-3">
             <Button variant="outline" size="sm" className="w-full">Google</Button>
             <Button variant="outline" size="sm" className="w-full">GitHub</Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t py-4 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            New here? <Link to="/register" className="font-semibold text-slate-900 hover:underline">Create an account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, name);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500 shadow-xl">
        <CardHeader title="Join SecureAuth" subtitle="Start your journey with AI-powered security" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Display Name" 
              placeholder="Alex Rivers" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input 
              label="Work Email" 
              type="email" 
              placeholder="alex@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Choose Password" 
              type="password" 
              placeholder="At least 8 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button className="w-full" type="submit" variant="indigo" isLoading={isLoading}>
              Get Started for Free
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t py-4">
          <p className="text-sm text-slate-500">
            Already a member? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [insight, setInsight] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getSecurityInsight(user.name).then(text => {
        setInsight(text);
        setIsInsightLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">S</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SecureAuth</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#" className="text-slate-900">Dashboard</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Analytics</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Team</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Settings</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="h-9 w-64 rounded-full border bg-slate-100 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all" />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-3">
              <img src={user?.avatar} alt={user?.name} className="h-9 w-9 rounded-full bg-slate-200 border border-slate-200" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-tight">{user?.name}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Premium Account</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-slate-400 hover:text-red-600">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Command Center</h1>
            <p className="text-slate-500 mt-1">Real-time status: <span className="text-green-600 font-semibold">Protected</span></p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">Download Report</Button>
            <Button variant="primary" size="sm">System Scan</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-12">
          {/* AI Insight Card */}
          <Card className="md:col-span-6 lg:col-span-8 bg-slate-900 border-none shadow-2xl overflow-visible relative">
            <div className="absolute -top-4 -right-4 h-16 w-16 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                   <Lock className="text-white" size={16} />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Security Intelligence</h2>
              </div>
              {isInsightLoading ? (
                <div className="space-y-4">
                  <div className="h-5 bg-white/10 rounded w-full animate-pulse"></div>
                  <div className="h-5 bg-white/10 rounded w-4/5 animate-pulse"></div>
                  <div className="h-5 bg-white/10 rounded w-3/5 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-xl leading-relaxed text-slate-300 font-medium italic">
                  "{insight}"
                </p>
              )}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">AI</div>)}
                </div>
                <span className="text-xs text-slate-400 font-mono">Last analysis: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="md:col-span-6 lg:col-span-4 space-y-6">
            <Card className="bg-white border-slate-100">
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Protection Score</p>
                      <h3 className="text-3xl font-black text-slate-900">98.4<span className="text-sm font-medium text-slate-400 ml-1">/100</span></h3>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-green-500 animate-[spin_3s_linear_infinite]"></div>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-white border-slate-100">
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Threats</p>
                      <h3 className="text-3xl font-black text-slate-900">0</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Shield size={24} />
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Activity Logs */}
          <Card className="md:col-span-6 lg:col-span-12">
            <CardHeader 
              title="Global Activity" 
              subtitle="Recent login attempts and data access logs across all synchronized devices" 
              icon={<Globe size={20} />}
            />
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border border-slate-50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="py-4 px-6">Event Source</th>
                      <th className="py-4 px-6">IP / Location</th>
                      <th className="py-4 px-6">Authentication</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { source: 'Chrome / macOS', loc: 'San Francisco, US', ip: '192.14.2.1', auth: 'Passkey', time: '2m ago', res: 'Verified' },
                      { source: 'Mobile App / iOS', loc: 'Berlin, DE', ip: '82.1.24.9', auth: 'FaceID', time: '4h ago', res: 'Verified' },
                      { source: 'Cloud Console', loc: 'Unknown', ip: '10.0.0.1', auth: 'Password', time: '12h ago', res: 'MFA Required' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4 px-6 flex items-center space-x-3">
                           <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                             <Activity size={14} />
                           </div>
                           <span className="font-bold text-slate-900">{row.source}</span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-700">{row.loc}</p>
                          <p className="text-[10px] font-mono text-slate-400">{row.ip}</p>
                        </td>
                        <td className="py-4 px-6">
                           <span className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">
                             <Key size={10} />
                             <span>{row.auth}</span>
                           </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">{row.time}</td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[11px] font-bold",
                            row.res === 'Verified' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {row.res}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 font-medium gap-4">
          <p>© 2024 SecureAuth AI Systems. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Security Audit</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Protected Routes ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 animate-pulse tracking-widest uppercase">Initializing Core...</p>
      </div>
    </div>
  );
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
