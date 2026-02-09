 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { ArrowLeft, User, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 
 export default function PersonalInfo() {
   const { user } = useAuth();
   const { t, isRTL } = useLanguage();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const [showPasswordForm, setShowPasswordForm] = useState(false);
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
 
   const fullName = user?.user_metadata?.full_name || '-';
   const phone = user?.user_metadata?.phone || '-';
 
   const handlePasswordChange = async () => {
     if (!newPassword || !confirmPassword) {
       toast({
         title: t('error'),
         description: t('fillAllFields'),
         variant: 'destructive',
       });
       return;
     }
 
     if (newPassword.length < 6) {
       toast({
         title: t('error'),
         description: t('passwordTooShort'),
         variant: 'destructive',
       });
       return;
     }
 
     if (newPassword !== confirmPassword) {
       toast({
         title: t('error'),
         description: t('passwordsDoNotMatch'),
         variant: 'destructive',
       });
       return;
     }
 
     setIsLoading(true);
 
     const { error } = await supabase.auth.updateUser({
       password: newPassword,
     });
 
     setIsLoading(false);
 
     if (error) {
       toast({
         title: t('error'),
         description: error.message,
         variant: 'destructive',
       });
       return;
     }
 
     toast({
       title: t('success'),
       description: t('passwordChanged'),
     });
 
     setShowPasswordForm(false);
     setCurrentPassword('');
     setNewPassword('');
     setConfirmPassword('');
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="bg-card border-b border-border sticky top-0 z-50">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center gap-3">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => navigate('/home')}
               className="text-muted-foreground"
             >
               <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
             </Button>
             <h1 className="font-semibold text-foreground">{t('personalInfo')}</h1>
           </div>
         </div>
       </header>
 
       {/* Main Content */}
       <main className="container mx-auto px-4 py-6 max-w-xl space-y-4">
         {/* User Info Card */}
         <Card className="card-clean">
           <CardHeader className="pb-3">
             <CardTitle className="text-base flex items-center gap-2">
               <User className="w-5 h-5 text-primary" />
               {t('accountInfo')}
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {/* Full Name */}
             <div className="space-y-1">
               <Label className="text-sm text-muted-foreground">{t('fullName')}</Label>
               <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
                 <User className="w-4 h-4 text-muted-foreground" />
                 <span className="text-foreground">{fullName}</span>
               </div>
             </div>
 
             {/* WhatsApp Number */}
             <div className="space-y-1">
               <Label className="text-sm text-muted-foreground">{t('whatsappNumber')}</Label>
               <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
                 <Phone className="w-4 h-4 text-muted-foreground" />
                 <span className="text-foreground" dir="ltr">{phone}</span>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Password Change Card */}
         <Card className="card-clean">
           <CardHeader className="pb-3">
             <CardTitle className="text-base flex items-center gap-2">
               <Lock className="w-5 h-5 text-primary" />
               {t('password')}
             </CardTitle>
           </CardHeader>
           <CardContent>
             {!showPasswordForm ? (
               <Button
                 variant="outline"
                 className="w-full"
                 onClick={() => setShowPasswordForm(true)}
               >
                 {t('changePassword')}
               </Button>
             ) : (
               <div className="space-y-4">
                 {/* New Password */}
                 <div className="space-y-1">
                   <Label className="text-sm">{t('newPassword')}</Label>
                   <div className="relative">
                     <Input
                       type={showNewPassword ? 'text' : 'password'}
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       className="pr-10"
                       placeholder="••••••••"
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       className="absolute right-0 top-0 h-full"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                     >
                       {showNewPassword ? (
                         <EyeOff className="w-4 h-4" />
                       ) : (
                         <Eye className="w-4 h-4" />
                       )}
                     </Button>
                   </div>
                 </div>
 
                 {/* Confirm Password */}
                 <div className="space-y-1">
                   <Label className="text-sm">{t('confirmPassword')}</Label>
                   <div className="relative">
                     <Input
                       type={showConfirmPassword ? 'text' : 'password'}
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="pr-10"
                       placeholder="••••••••"
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       className="absolute right-0 top-0 h-full"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     >
                       {showConfirmPassword ? (
                         <EyeOff className="w-4 h-4" />
                       ) : (
                         <Eye className="w-4 h-4" />
                       )}
                     </Button>
                   </div>
                 </div>
 
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     className="flex-1"
                     onClick={() => {
                       setShowPasswordForm(false);
                       setNewPassword('');
                       setConfirmPassword('');
                     }}
                   >
                     {t('cancel')}
                   </Button>
                   <Button
                     className="flex-1"
                     onClick={handlePasswordChange}
                     disabled={isLoading}
                   >
                     {isLoading ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       t('save')
                     )}
                   </Button>
                 </div>
               </div>
             )}
           </CardContent>
         </Card>
       </main>
     </div>
   );
 }