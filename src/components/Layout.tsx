
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    // We don't need to navigate here as it's now handled by the onLogout callback
  };
  
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    ...(currentUser.role === "admin" 
      ? [{ label: "Manage Elections", path: "/manage-elections" }] 
      : []),
    ...(currentUser.role === "candidate" 
      ? [{ label: "My Applications", path: "/my-applications" }] 
      : []),
    { label: "Elections", path: "/elections" },
    { label: "Results", path: "/results" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-election-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-xl md:text-2xl font-bold cursor-pointer" 
              onClick={() => navigate("/dashboard")}
            >
              VoteSphere
            </h1>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu />
            </Button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                className="text-white hover:bg-election-secondary"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">
              {currentUser.name} ({currentUser.role})
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-election-secondary"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {menuOpen && (
          <div className="md:hidden bg-election-secondary">
            <div className="container mx-auto px-4 py-2">
              {navItems.map((item) => (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-election-primary"
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <div className="py-2 px-4 text-sm">
                {currentUser.name} ({currentUser.role})
              </div>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 VoteSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
