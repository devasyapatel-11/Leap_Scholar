 import { useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { AuthLayout } from '@/components/auth/AuthLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2 } from 'lucide-react';
 
 export default function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const { signIn } = useAuth();
   const { toast } = useToast();
   const navigate = useNavigate();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     const { error } = await signIn(email, password);
 
     if (error) {
       toast({
         title: 'Login failed',
         description: error.message,
         variant: 'destructive',
       });
       setIsLoading(false);
       return;
     }
 
     navigate('/dashboard');
   };
 
   return (
     <AuthLayout 
       title="Welcome back" 
       subtitle="Sign in to continue your Leap Scholar IELTS preparation"
     >
       <form onSubmit={handleSubmit} className="space-y-6">
         <div className="space-y-2">
           <Label htmlFor="email">Email</Label>
           <Input
             id="email"
             type="email"
             placeholder="you@example.com"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             autoComplete="email"
           />
         </div>
 
         <div className="space-y-2">
           <Label htmlFor="password">Password</Label>
           <Input
             id="password"
             type="password"
             placeholder="••••••••"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             autoComplete="current-password"
           />
         </div>
 
         <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Signing in...
             </>
           ) : (
             'Sign in'
           )}
         </Button>
       </form>
 
       <p className="mt-6 text-center text-sm text-muted-foreground">
         Don't have an account?{' '}
         <Link to="/signup" className="font-medium text-primary hover:underline">
           Sign up
         </Link>
       </p>
     </AuthLayout>
   );
 }