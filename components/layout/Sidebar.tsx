import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, AreaChart, Wrench, Bot, SlidersHorizontal, Settings, Wifi, WifiOff, UserCircle, LogOut, User } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';

interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Site Detail', path: '/site-detail', icon: AreaChart },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Simulator', path: '/simulator', icon: SlidersHorizontal },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setSidebarOpen }) => {
  const context = useContext(AppContext);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusIndicator = () => {
    if (context?.connectionStatus === 'connected') {
      return <div className="flex items-center text-green-500"><Wifi className="w-5 h-5 mr-2" /><span className="hidden sm:inline">Online</span></div>;
    }
    if (context?.connectionStatus === 'connecting') {
      return <div className="flex items-center text-yellow-500"><Wifi className="w-5 h-5 mr-2 animate-pulse" /><span className="hidden sm:inline">Connecting...</span></div>;
    }
    return <div className="flex items-center text-red-500"><WifiOff className="w-5 h-5 mr-2" /><span className="hidden sm:inline">Offline</span></div>;
  };

  const NavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 md:py-3 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-violet-600 text-white rounded-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md'
        }`
      }
      onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
    >
      <item.icon className="w-5 h-5 mr-2" />
      <span>{item.name}</span>
    </NavLink>
  );

  return (
    <>
      <nav className={`z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`} aria-label="Top Navigation">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-violet-500" />
            <span className="text-base font-semibold text-gray-900 dark:text-white ml-2">EMS Pro</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
          <div className="flex items-center space-x-4">
            {statusIndicator()}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 hidden sm:block"></div>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <UserCircle className="w-7 h-7 text-gray-400 dark:text-gray-500"/>
                <span className="ml-2 text-sm font-medium hidden lg:block">operator@ems.com</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold">Operator User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">operator@ems.com</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <NavLink
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          context?.logout();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:hidden overflow-x-auto">
          <ul className="flex items-center space-x-1 px-2 pb-2">
            {navItems.map((item) => (
              <li key={item.name} className="flex-shrink-0">
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;