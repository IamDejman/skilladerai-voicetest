import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import AdminDashboard from "./AdminDashboard";
import TypingTexts from "./TypingTexts";
import { Loader2 } from "lucide-react";

const AdminIndex = () => {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated as admin
    const checkAuth = () => {
      const employerAuth = localStorage.getItem("employerAuth");
      
      if (!employerAuth) {
        // Redirect to login if not authenticated
        navigate("/login");
        return;
      }
      
      try {
        const authData = JSON.parse(employerAuth);
        if (authData && authData.id) {
          setIsAuthenticated(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        navigate("/login");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect to login in useEffect
  }

  return (
    <Switch>
      <Route path="/admin">
        {window.location.pathname === "/admin" ? <AdminDashboard /> : null}
      </Route>
      <Route path="/admin/typing-texts">
        <TypingTexts />
      </Route>
      <Route>
        <AdminDashboard />
      </Route>
    </Switch>
  );
};

export default AdminIndex;