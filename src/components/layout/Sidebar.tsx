
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  LayoutDashboard,
  Pill,
  FileSpreadsheet,
  BellRing,
  AlertTriangle,
  LogOut,
  CheckCircle,
  Package
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    {icon}
    <span className={cn(
      "transition-opacity duration-200",
      !isActive && "group-hover:text-primary"
    )}>{label}</span>
  </Link>
);

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  return (
    <aside 
      className={cn(
        'bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out h-full',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className={cn('flex items-center', !isOpen && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
              P
            </div>
            {isOpen && (
              <div className="ml-2 overflow-hidden">
                <p className="font-semibold text-gray-900">PharmTrack</p>
                <p className="text-xs text-gray-500 truncate">Expiry Management</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            <SidebarItem 
              icon={<Home size={20} />} 
              label={isOpen ? "Home" : ""}
              href="/app/home" 
              isActive={location.pathname === '/app/home'} 
            />
            
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label={isOpen ? "Dashboard" : ""}
              href="/app/dashboard" 
              isActive={location.pathname === '/app/dashboard'} 
            />
            
            <SidebarItem 
              icon={<Pill size={20} />} 
              label={isOpen ? "Medicines" : ""}
              href="/app/medicines" 
              isActive={location.pathname === '/app/medicines'} 
            />
            
            <SidebarItem 
              icon={<AlertTriangle size={20} />} 
              label={isOpen ? "Expiring Soon" : ""}
              href="/app/expiring-soon" 
              isActive={location.pathname === '/app/expiring-soon'} 
            />
            
            <SidebarItem 
              icon={<CheckCircle size={20} />} 
              label={isOpen ? "Safe Medicines" : ""}
              href="/app/safe-medicines" 
              isActive={location.pathname === '/app/safe-medicines'} 
            />
            
            <SidebarItem 
              icon={<Package size={20} />} 
              label={isOpen ? "Inventory" : ""}
              href="/app/inventory" 
              isActive={location.pathname === '/app/inventory'} 
            />
            
            <SidebarItem 
              icon={<FileSpreadsheet size={20} />} 
              label={isOpen ? "CSV Upload" : ""}
              href="/app/csv-upload" 
              isActive={location.pathname === '/app/csv-upload'} 
            />
            
            <SidebarItem 
              icon={<BellRing size={20} />} 
              label={isOpen ? "Notifications" : ""}
              href="/app/notifications" 
              isActive={location.pathname === '/app/notifications'} 
            />
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          {isOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-1 rounded-md hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={18} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <button 
              onClick={logout}
              className="w-full p-2 flex justify-center rounded-md hover:bg-gray-100" 
              title="Logout"
            >
              <LogOut size={20} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
