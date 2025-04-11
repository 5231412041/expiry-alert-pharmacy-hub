
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">PharmTrack</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="ml-2 flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="ml-2 text-sm font-medium hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
