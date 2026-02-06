 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { AuthLayout } from '@/components/auth/AuthLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, CheckCircle } from 'lucide-react';
 
 export default function Signup() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);
   const { signUp } = useAuth();
   const { toast } = useToast();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (password !== confirmPassword) {
       toast({
         title: 'Passwords do not match',
         description: 'Please make sure your passwords match.',
         variant: 'destructive',
       });
       return;
     }
 
     if (password.length < 6) {
       toast({
         title: 'Password too short',
         description: 'Password must be at least 6 characters.',
         variant: 'destructive',
       });
       return;
     }
 
     setIsLoading(true);
 
     const { error } = await signUp(email, password);
 
     if (error) {
       toast({
         title: 'Sign up failed',
         description: error.message,
         variant: 'destructive',
       });
       setIsLoading(false);
       return;
     }
 
     setIsSuccess(true);
     setIsLoading(false);
   };
 
   if (isSuccess) {
     return (
       <AuthLayout 
         title="Check your email" 
         subtitle="We've sent you a confirmation link"
       >
         <div className="text-center py-8">
           <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
             <CheckCircle className="w-8 h-8 text-success" />
           </div>
           <p className="text-muted-foreground mb-6">
             We sent a confirmation email to <strong className="text-foreground">{email}</strong>.
             Please click the link in the email to verify your account.
           </p>
           <Button variant="outline" asChild>
             <Link to="/login">Back to login</Link>
           </Button>
         </div>
       </AuthLayout>
     );
   }
 
   return (
     <AuthLayout 
       title="Create your account" 
       subtitle="Start your personalized Leap Scholar IELTS journey"
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
             autoComplete="new-password"
           />
           <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
         </div>
 
         <div className="space-y-2">
           <Label htmlFor="confirmPassword">Confirm Password</Label>
           <Input
             id="confirmPassword"
             type="password"
             placeholder="••••••••"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             required
             autoComplete="new-password"
           />
         </div>
 
         <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Creating account...
             </>
           ) : (
             'Create account'
           )}
         </Button>
       </form>
 
       <p className="mt-6 text-center text-sm text-muted-foreground">
         Already have an account?{' '}
         <Link to="/login" className="font-medium text-primary hover:underline">
           Sign in
         </Link>
       </p>
     </AuthLayout>
   );
 }