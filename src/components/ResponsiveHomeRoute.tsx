import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Homepage from '@/pages/Homepage';

const MOBILE_BREAKPOINT = 768;

export function ResponsiveHomeRoute() {
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Wait for both auth and screen size check
  if (loading || isMobile === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mobile users go directly to auth
  if (isMobile) {
    return <Navigate to="/auth" replace />;
  }

  // Tablet/Desktop users see the homepage
  return <Homepage />;
}
