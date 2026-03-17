import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';

export const BannedUserPopup = () => {
  const { user, signOut } = useAuth();
  const [banned, setBanned] = useState(false);
  const [bannedEmail, setBannedEmail] = useState('');

  useEffect(() => {
    if (!user?.email) return;

    const checkBan = async () => {
      const { data } = await supabase
        .from('banned_users')
        .select('email')
        .maybeSingle();

      if (data) {
        setBanned(true);
        setBannedEmail(user.email!);
      }
    };

    checkBan();
  }, [user?.email]);

  const handleAcknowledge = async () => {
    await signOut();
    setBanned(false);
  };

  if (!banned) return null;

  return (
    <AlertDialog open={banned}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Account Banned</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            Your account <strong className="text-foreground">{bannedEmail}</strong> has been banned. 
            You will be signed out. You may place orders using a different account or as a guest.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
