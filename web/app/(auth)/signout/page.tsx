'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';

interface SignOutComponentProps {
  userName?: string;
  userImage?: string;
}

export default function SignOutComponent({
  userName = 'User',
  userImage,
}: SignOutComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirectTo: '/signin' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {userImage && (
        <img
          src={userImage}
          alt={userName}
          className="h-9 w-9 rounded-full border border-border"
        />
      )}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-foreground">{userName}</p>
        <p className="text-xs text-muted-foreground">Signed in</p>
      </div>
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="ml-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </>
        )}
      </Button>
    </div>
  );
}
