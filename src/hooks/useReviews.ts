import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { homeReviews as seedReviews, HomeReview } from '@/data/homeReviews';

export const ADMIN_EMAIL = 'ewhz3384@gmail.com';

export interface DbReview {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  text: string | null;
  status: 'pending' | 'approved';
  is_admin_added: boolean;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  source: 'seed' | 'db';
  status?: 'pending' | 'approved';
  user_id?: string | null;
  isOwn?: boolean;
  images?: string[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const seedAsUnified: UnifiedReview[] = seedReviews.map((r: HomeReview) => ({
  id: `seed-${r.id}`,
  name: r.name,
  rating: r.rating,
  text: r.text,
  date: r.date,
  verified: r.verified,
  source: 'seed',
  status: 'approved',
}));

const dbToUnified = (r: DbReview, currentUserId?: string | null): UnifiedReview => ({
  id: r.id,
  name: r.customer_name || 'Anonymous',
  rating: r.rating,
  text: r.text || '',
  date: formatDate(r.created_at),
  verified: true,
  source: 'db',
  status: r.status,
  user_id: r.user_id,
  isOwn: !!currentUserId && r.user_id === currentUserId,
  images: Array.isArray(r.images) ? r.images : [],
});

/**
 * Returns merged reviews (seed + db) visible to the current viewer.
 * - Anyone sees approved reviews
 * - Logged-in user additionally sees their own pending reviews
 * - Admin sees ALL db reviews
 */
export const useReviews = () => {
  const { user } = useAuth();
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setDbReviews(data as DbReview[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, user?.id]);

  const allDbUnified = dbReviews.map((r) => dbToUnified(r, user?.id));

  // Public-facing list = approved db reviews + user's own pending + seed
  const visibleReviews: UnifiedReview[] = [
    ...allDbUnified.filter((r) => r.status === 'approved' || r.isOwn),
    ...seedAsUnified,
  ];

  return {
    visibleReviews,
    allDbReviews: dbReviews,
    pendingReviews: dbReviews.filter((r) => r.status === 'pending'),
    loading,
    refresh: fetchReviews,
    isAdmin,
    user,
  };
};

export const submitReview = async (params: {
  user_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  text: string;
  images?: string[];
}) => {
  return supabase.from('reviews').insert({
    user_id: params.user_id,
    customer_name: params.customer_name.slice(0, 80),
    customer_email: params.customer_email,
    rating: params.rating,
    text: params.text.slice(0, 1000) || null,
    status: 'pending',
    is_admin_added: false,
    images: params.images ?? [],
  });
};

export const adminAddReview = async (params: {
  customer_name: string;
  rating: number;
  text: string;
  images?: string[];
}) => {
  return supabase.from('reviews').insert({
    user_id: null,
    customer_name: params.customer_name.slice(0, 80),
    customer_email: null,
    rating: params.rating,
    text: params.text.slice(0, 1000) || null,
    status: 'approved',
    is_admin_added: true,
    images: params.images ?? [],
  });
};

export const adminUpdateReview = async (
  id: string,
  patch: Partial<Pick<DbReview, 'customer_name' | 'rating' | 'text' | 'status'>>
) => supabase.from('reviews').update(patch).eq('id', id);

export const adminDeleteReview = async (id: string) =>
  supabase.from('reviews').delete().eq('id', id);

export const adminApproveReview = async (id: string) =>
  supabase.from('reviews').update({ status: 'approved' }).eq('id', id);
