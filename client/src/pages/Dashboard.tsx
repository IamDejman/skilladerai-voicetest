import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a session to verify employee access
    const sessionId = sessionStorage.getItem('assessmentSessionId');
    const sessionValid = sessionStorage.getItem('sessionValid');
    
    if (!sessionId) {
      // No session found, redirect to home
      toast({
        title: "Access Denied",
        description: "Please log in to access the employee dashboard.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    // Simulate fetching employee data (in a real app, this would be an API call)
    setLoading(true);
    const candidateData = JSON.parse(sessionStorage.getItem('candidateData') || '{}');
    
    // Pretend to load employee data
    setTimeout(() => {
      setEmployeeData({
        name: candidateData?.personalInfo?.fullName || 'Employee',
        email: candidateData?.personalInfo?.email || 'employee@example.com',
        role: 'Customer Service Representative',
        department: 'Support',
        status: 'Onboarding',
        completedAssessments: ['Typing', 'Reading', 'Grammar'],
        pendingAssessments: [],
        performanceScore: 85,
        lastLogin: new Date().toLocaleDateString()
      });
      setLoading(false);
    }, 800);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fb] dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-nunito font-bold">
                Employee Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome to the skilladder AI employee portal
              </p>
            </div>
            
            <Badge className="bg-green-500 text-white px-4 py-1.5 text-sm font-medium">
              ONBOARDING
            </Badge>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Profile Card */}
              <Card className="col-span-1">
                <CardHeader className="bg-gradient-to-r from-primary to-[#3d8c40] text-white">
                  <CardTitle className="text-xl font-nunito font-bold">Employee Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                      {/* Default avatar with initials */}
                      <span className="text-2xl font-bold text-gray-600">
                        {employeeData?.name?.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{employeeData?.name}</h3>
                    <p className="text-gray-500 mb-4">{employeeData?.email}</p>
                    
                    <div className="w-full space-y-3 mt-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Role:</span>
                        <span className="text-sm">{employeeData?.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Department:</span>
                        <span className="text-sm">{employeeData?.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm">{employeeData?.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Last Login:</span>
                        <span className="text-sm">{employeeData?.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Assessment Progress Card */}
              <Card className="col-span-1">
                <CardHeader className="bg-gradient-to-r from-accent to-[#8c3d8d] text-white">
                  <CardTitle className="text-xl font-nunito font-bold">Assessment Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Overall Progress</h4>
                        <span className="text-sm font-bold">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="font-medium mb-3">Completed Assessments</h4>
                      <div className="space-y-2">
                        {employeeData?.completedAssessments.map((assessment: string, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{assessment} Assessment</span>
                            <Badge className="bg-green-500">Completed</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {employeeData?.pendingAssessments.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-3">Pending Assessments</h4>
                        <div className="space-y-2">
                          {employeeData?.pendingAssessments.map((assessment: string, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{assessment} Assessment</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Performance Metrics Card */}
              <Card className="col-span-1">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardTitle className="text-xl font-nunito font-bold">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{employeeData?.performanceScore}</span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="3"
                          strokeDasharray={`${employeeData?.performanceScore}, 100`}
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Overall Performance Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Typing Speed</span>
                        <span className="font-semibold">85 WPM</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reading Comprehension</span>
                        <span className="font-semibold">90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Grammar Accuracy</span>
                        <span className="font-semibold">80%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-gray-50">
                  <Button className="w-full" variant="outline">View Detailed Report</Button>
                </CardFooter>
              </Card>
              
              {/* Next Steps Card - Spans full width */}
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="text-xl font-nunito font-bold">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-2">Complete Onboarding</h3>
                      <p className="text-gray-600 mb-4">Review company policies and complete your onboarding documents.</p>
                      <Button size="sm" variant="outline">Start Now</Button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-2">Training Sessions</h3>
                      <p className="text-gray-600 mb-4">Schedule your initial training sessions with your team lead.</p>
                      <Button size="sm" variant="outline">View Schedule</Button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-bold mb-2">Meet Your Team</h3>
                      <p className="text-gray-600 mb-4">Join the upcoming virtual meet-and-greet with your department.</p>
                      <Button size="sm" variant="outline">RSVP</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}