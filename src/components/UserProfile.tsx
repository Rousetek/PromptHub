
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  onSignInClick: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSignInClick }) => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Button onClick={onSignInClick} variant="outline">
        Sign In
      </Button>
    );
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-700 hidden sm:block">
        {user.email}
      </span>
      <Button onClick={signOut} variant="outline" size="sm">
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
