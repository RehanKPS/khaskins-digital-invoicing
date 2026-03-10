import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@khaskins.pk');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email) {
      setUser({ id: '1', email, name: 'Admin User', role: 'admin' });
      toast({ title: 'Welcome back!', description: 'Login successful.' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Login Failed', description: 'Invalid credentials.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0f9ff' }}>
      <Card className="w-full max-w-md shadow-xl border-0 animate-fade-in">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary-foreground">K</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">KHASKINS (PVT) LTD</h1>
          <p className="text-sm text-muted-foreground mt-1">Digital Invoicing Portal</p>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-3" />
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@khaskins.pk" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
