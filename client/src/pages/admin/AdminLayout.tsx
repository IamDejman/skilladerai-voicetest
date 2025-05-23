import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  BarChart3,
  Settings,
  FileText,
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocation] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);
  const { toast } = useToast();
  
  // Check for admin authentication
  useEffect(() => {
    const storedAuth = localStorage.getItem("employerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setAdminUser(parsedAuth);
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("employerAuth");
    window.location.href = "/login";
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/admin",
      badge: null,
    },
    {
      name: "Candidates",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/candidates",
      badge: "New",
    },
    {
      name: "Typing Texts",
      icon: <FileText className="h-5 w-5" />,
      path: "/admin/typing-texts",
      badge: "New",
    },
    {
      name: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/admin/analytics",
      badge: null,
    },
    {
      name: "Reports",
      icon: <FileText className="h-5 w-5" />,
      path: "/admin/reports",
      badge: null,
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/settings",
      badge: null,
    },
  ];
  
  const isActiveRoute = (path: string) => {
    if (path === "/admin" && currentLocation === "/admin") {
      return true;
    }
    return currentLocation.startsWith(path) && path !== "/admin";
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } flex flex-col transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/admin" className="flex items-center">
            <img src="/logo-nobackground.png" alt="skilladder AI" className="h-8 w-auto" />
            {!sidebarCollapsed && (
              <span className="ml-2 text-lg font-bold text-gray-800 dark:text-white">
                skilladder <span className="text-primary">AI</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActiveRoute(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${sidebarCollapsed ? "justify-center" : "justify-start"}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="ml-3 flex-1">{item.name}</span>
              )}
              {!sidebarCollapsed && item.badge && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
        
        {/* User profile */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex ${sidebarCollapsed ? "justify-center" : "items-center"}`}>
            {sidebarCollapsed ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <>
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {adminUser?.name || "Admin User"}
                  </p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {adminUser?.role === "superAdmin" ? "Super Admin" : 
                       adminUser?.role === "hrManager" ? "HR Manager" : "Reviewer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}>
        {/* Top navigation */}
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>skilladder AI</span>
            <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentLocation === '/admin' 
                ? 'Dashboard' 
                : currentLocation.includes('/admin/candidates') 
                  ? 'Candidates'
                  : currentLocation.includes('/admin/analytics')
                    ? 'Analytics'
                    : currentLocation.includes('/admin/reports')
                      ? 'Reports'
                      : 'Settings'}
            </span>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-md mx-auto md:mx-0 md:ml-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search candidates..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="ml-4 flex items-center space-x-4">
            {/* Help button */}
            <button 
              className="hidden md:flex items-center text-sm text-primary hover:text-primary/80"
              aria-label="Get help"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </button>
            
            {/* Notifications */}
            <button 
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
            
            {/* Profile dropdown (mobile) */}
            <div className="lg:hidden">
              <button 
                className="flex items-center"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;