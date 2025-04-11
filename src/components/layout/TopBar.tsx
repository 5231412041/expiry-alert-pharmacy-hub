
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">PharmTrack</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')}>
              Manage Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              {user?.role === 'admin' ? '3 expired medicines' : 'Check expiration status'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-orange-500">
              {user?.role === 'admin' ? '5 medicines expiring soon' : 'View upcoming expirations'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-primary"
          onClick={() => setSettingsOpen(true)}
        >
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
      
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure your application preferences
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Account</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setSettingsOpen(false);
                  // Navigate to profile page if you create one
                }}
              >
                Profile Settings
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Notifications</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setSettingsOpen(false);
                  navigate('/notifications');
                }}
              >
                Notification Settings
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Appearance</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                Theme Settings
              </Button>
            </div>
            
            {user?.role === 'admin' && (
              <div>
                <h3 className="text-sm font-medium mb-2">Administration</h3>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setSettingsOpen(false);
                    navigate('/notifications');
                  }}
                >
                  Manage Recipients
                </Button>
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default TopBar;
