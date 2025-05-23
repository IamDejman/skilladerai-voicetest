import { useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"candidate" | "employer">("candidate");
  
  // Candidate Login
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);
  
  // Employer Login
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");
  const [employerLoading, setEmployerLoading] = useState(false);

  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateEmail || !candidatePassword) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setCandidateLoading(true);
    
    try {
      // In a real implementation, we'd call the API
      // const response = await apiRequest('/api/auth/candidate/login', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     email: candidateEmail,
      //     password: candidatePassword
      //   })
      // });
      
      // For now, simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check against demo credentials
      if (candidateEmail === "demo@example.com" && candidatePassword === "password") {
        // Store authentication info in localStorage
        localStorage.setItem("candidateAuth", JSON.stringify({
          id: "123",
          email: candidateEmail,
          name: "Demo Candidate"
        }));
        
        // Navigate to assessment
        navigate("/assessment");
        
        toast({
          title: "Login successful",
          description: "Welcome back to skilladder AI",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "There was an error logging in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleEmployerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employerEmail || !employerPassword) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setEmployerLoading(true);
    
    try {
      // In a real implementation, we'd call the API
      // const response = await apiRequest('/api/auth/employer/login', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     email: employerEmail,
      //     password: employerPassword
      //   })
      // });
      
      // For now, simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check against demo employer credentials
      if (employerEmail === "admin@skilladder.ai" && employerPassword === "admin123") {
        // Store authentication info in localStorage
        localStorage.setItem("employerAuth", JSON.stringify({
          id: "admin1",
          email: employerEmail,
          role: "superAdmin",
          name: "Admin User"
        }));
        
        // Navigate to admin dashboard
        navigate("/admin");
        
        toast({
          title: "Login successful",
          description: "Welcome to the skilladder AI admin dashboard",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "There was an error logging in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEmployerLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-16 pt-24 px-4 sm:px-6 lg:px-8 bg-neutral">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-[#3d8c40] text-white">
              <CardTitle className="text-2xl font-nunito font-bold text-center">
                Login to skilladder AI
              </CardTitle>
              <CardDescription className="text-white/90 font-opensans text-center">
                Access your account to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 mt-4">
              <Tabs defaultValue="candidate" className="w-full" onValueChange={(value) => setUserType(value as "candidate" | "employer")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="candidate">Candidate</TabsTrigger>
                  <TabsTrigger value="employer">Employer</TabsTrigger>
                </TabsList>
                
                <TabsContent value="candidate">
                  <form onSubmit={handleCandidateLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidate-email" className="font-nunito font-bold">
                        Email
                      </Label>
                      <Input
                        id="candidate-email"
                        type="email"
                        placeholder="your@email.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="font-opensans"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="candidate-password" className="font-nunito font-bold">
                          Password
                        </Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="candidate-password"
                        type="password"
                        placeholder="••••••••"
                        value={candidatePassword}
                        onChange={(e) => setCandidatePassword(e.target.value)}
                        className="font-opensans"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-[#3d8c40] font-nunito font-bold"
                      disabled={candidateLoading}
                    >
                      {candidateLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Logging in...
                        </span>
                      ) : (
                        "Login"
                      )}
                    </Button>
                    
                    <div className="text-center text-sm font-opensans text-text/70 mt-4">
                      Don't have an account?{" "}
                      <Link href="/quiz" className="text-primary hover:underline">
                        Register now
                      </Link>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="employer">
                  <form onSubmit={handleEmployerLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer-email" className="font-nunito font-bold">
                        Email
                      </Label>
                      <Input
                        id="employer-email"
                        type="email"
                        placeholder="your@company.com"
                        value={employerEmail}
                        onChange={(e) => setEmployerEmail(e.target.value)}
                        className="font-opensans"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="employer-password" className="font-nunito font-bold">
                          Password
                        </Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="employer-password"
                        type="password"
                        placeholder="••••••••"
                        value={employerPassword}
                        onChange={(e) => setEmployerPassword(e.target.value)}
                        className="font-opensans"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-[#3d8c40] font-nunito font-bold"
                      disabled={employerLoading}
                    >
                      {employerLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Logging in...
                        </span>
                      ) : (
                        "Login"
                      )}
                    </Button>
                    
                    <div className="text-center text-sm font-opensans text-text/70 mt-4">
                      Need an employer account?{" "}
                      <Link href="/contact" className="text-primary hover:underline">
                        Contact sales
                      </Link>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="bg-neutral/50 p-6">
              <div className="w-full text-center text-xs text-text/60 font-opensans">
                By logging in, you agree to our{" "}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}