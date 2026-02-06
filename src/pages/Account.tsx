import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const displayName = user.user_metadata?.full_name || 'My Account';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-20 md:py-28 bg-background">
      <div className="container max-w-2xl">
        {/* Account Header */}
        <div className="flex items-center gap-5 py-8 border-b border-border">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-none text-xs font-medium tracking-[0.1em] uppercase gap-2 shrink-0"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Purchase History */}
        <div className="pt-10">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            <h2 className="text-lg font-medium text-foreground">Purchase History</h2>
          </div>

          <div className="bg-secondary/50 border border-border p-12 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
            <p className="text-muted-foreground mb-6">No purchases yet</p>
            <Button asChild className="rounded-none text-xs font-medium tracking-[0.15em] uppercase">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
