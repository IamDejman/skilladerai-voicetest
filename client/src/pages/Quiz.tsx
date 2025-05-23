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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
// Import the Google Places Autocomplete component
import { LocationInput } from "@/components/LocationInput";

// Define registration fields based on requirements
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

interface Experience {
  customerServiceYears: string;
  previousCallCenter: boolean | null;
  englishProficiency: string; // Basic/Intermediate/Advanced
}

interface RegistrationData {
  personalInfo: PersonalInfo;
  experience: Experience;
}

// Google Maps API integration will be added here in the future

const Quiz = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Personal Info State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Experience State
  const [customerServiceYears, setCustomerServiceYears] = useState<string>("");
  const [previousCallCenter, setPreviousCallCenter] = useState<boolean | null>(null);
  const [englishProficiency, setEnglishProficiency] = useState<string>("");

  // State for form validation
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);

  // Check form validity whenever fields change
  useEffect(() => {
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);

    // Phone regex validation
    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    const isPhoneValid = phoneRegex.test(phone);

    // Step 1 validation
    setStep1Valid(
      !!fullName &&
        !!email &&
        isEmailValid &&
        !!phone &&
        isPhoneValid &&
        !!location,
    );

    // Step 2 validation
    const yearsValue = parseInt(customerServiceYears as string) || 0;
    setStep2Valid(
      customerServiceYears !== "" &&
        yearsValue >= 0 &&
        previousCallCenter !== null &&
        !!englishProficiency
    );
  }, [
    fullName,
    email,
    phone,
    location,
    customerServiceYears,
    englishProficiency,
  ]);

  // Google Maps integration will be implemented in the future
  // This will include location autocomplete based on user input

  const handleNextStep = () => {
    // Basic validation for Step 1
    if (currentStep === 1) {
      if (!step1Valid) {
        toast({
          title: "Missing or invalid information",
          description: "Please fill in all required fields correctly",
          variant: "destructive",
        });
        return;
      }

      // Move to step 2 and scroll to top
      setCurrentStep(2);
      window.scrollTo(0, 0);
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for Step 2
    if (!englishProficiency) {
      toast({
        title: "Missing information",
        description: "Please select your English proficiency level",
        variant: "destructive",
      });
      return;
    }

    const yearsValue = parseInt(customerServiceYears as string);
    if (customerServiceYears === "" || isNaN(yearsValue) || yearsValue < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of years",
        variant: "destructive",
      });
      return;
    }

    // Create registration data object
    const registrationData: RegistrationData = {
      personalInfo: {
        fullName,
        email,
        phone,
        location,
      },
      experience: {
        customerServiceYears,
        previousCallCenter,
        englishProficiency,
      },
    };

    setLoading(true);

    try {
      // Call the API to register candidate and create session
      const response = await fetch('/api/register-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      // Parse successful response data
      const responseData = await response.json();
      
      // Store registration data and session ID from the API response
      sessionStorage.setItem("candidateData", JSON.stringify(registrationData));
      sessionStorage.setItem("assessmentSessionId", responseData.sessionId);
      sessionStorage.setItem("sessionCreatedAt", responseData.sessionCreatedAt);
      sessionStorage.setItem("sessionValid", "true");
      
      // Log registration timestamp for audit trail
      console.log(`Registration completed at ${responseData.timestamp}`);

      // Navigate to initial assessment (typing test) and scroll to top
      window.scrollTo(0, 0);
      navigate("/assessment");

      toast({
        title: "Registration successful!",
        description: "You are now ready to begin the assessment",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 pt-24 px-4 sm:px-6 lg:px-8 bg-neutral">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-[#3d8c40] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-nunito font-bold">
                    Customer Service Assessment
                  </CardTitle>
                  <CardDescription className="text-white/90 font-opensans">
                    {currentStep === 1
                      ? "Step 1: Complete your profile"
                      : "Step 2: Experience information"}
                  </CardDescription>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  className="h-2 bg-white/30"
                />
              </div>
            </CardHeader>

            <CardContent className="p-6 mt-4">
              <form
                onSubmit={
                  currentStep === totalSteps
                    ? handleRegistration
                    : handleNextStep
                }
                className="space-y-6"
              >
                {currentStep === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="font-nunito font-bold"
                        >
                          Full Name <span className="text-[#F44336]">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="font-opensans"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="font-nunito font-bold"
                        >
                          Email Address{" "}
                          <span className="text-[#F44336]">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="font-opensans"
                          required
                        />
                        <p className="text-xs text-text/70 font-opensans">
                          We'll send your assessment results to this email
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="font-nunito font-bold"
                        >
                          Phone Number <span className="text-[#F44336]">*</span>
                        </Label>
                        <Input
                          id="phone"
                          placeholder="e.g. +234 803-123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="font-opensans"
                          required
                        />
                      </div>

                      <LocationInput
                        label="Location"
                        required
                        value={location}
                        onChange={setLocation}
                        className="space-y-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="customerServiceYears"
                          className="font-nunito font-bold"
                        >
                          Years of Customer Service Experience{" "}
                          <span className="text-[#F44336]">*</span>
                        </Label>
                        <Input
                          id="customerServiceYears"
                          type="number"
                          min="0"
                          placeholder="Enter number of years"
                          value={customerServiceYears}
                          onChange={(e) => setCustomerServiceYears(e.target.value)}
                          className="font-opensans"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-nunito font-bold">
                          Previous Call Center Experience{" "}
                          <span className="text-[#F44336]">*</span>
                        </Label>
                        <div className="flex space-x-4 mt-2">
                          <Button
                            type="button"
                            variant={previousCallCenter === true ? "default" : "outline"}
                            className={
                              previousCallCenter === true
                                ? "bg-primary hover:bg-primary/90"
                                : ""
                            }
                            onClick={() => setPreviousCallCenter(true)}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={
                              previousCallCenter === false ? "default" : "outline"
                            }
                            className={
                              previousCallCenter === false
                                ? "bg-primary hover:bg-primary/90"
                                : ""
                            }
                            onClick={() => setPreviousCallCenter(false)}
                          >
                            No
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="englishProficiency"
                          className="font-nunito font-bold"
                        >
                          English Proficiency (Self-Assessment){" "}
                          <span className="text-[#F44336]">*</span>
                        </Label>
                        <Select
                          onValueChange={setEnglishProficiency}
                          value={englishProficiency}
                        >
                          <SelectTrigger className="w-full font-opensans">
                            <SelectValue placeholder="Select your proficiency level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">
                              Basic - Can understand simple conversations
                            </SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate - Can have everyday conversations
                            </SelectItem>
                            <SelectItem value="Advanced">
                              Advanced - Can communicate fluently
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-neutral/30 p-4 rounded-lg">
                      <h3 className="font-nunito font-bold text-lg mb-2">
                        Assessment Overview
                      </h3>
                      <p className="text-sm font-opensans text-text/80 mb-3">
                        Our assessment process consists of two stages:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm font-opensans text-text/80">
                        <li>
                          <span className="font-semibold">
                            Initial Screener (10 minutes):
                          </span>{" "}
                          Typing test, reading comprehension, and grammar
                          assessment
                        </li>
                        <li>
                          <span className="font-semibold">
                            Detailed Assessment (25 minutes):
                          </span>{" "}
                          Voice analysis, situational judgment, and customer
                          interaction simulation
                        </li>
                      </ol>
                      <p className="text-sm font-opensans text-text/80 mt-3">
                        Candidates who pass the initial screener will be invited
                        to the detailed assessment.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="font-nunito"
                    >
                      <i className="ri-arrow-left-line mr-1"></i> Back
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="font-nunito"
                      onClick={() => navigate("/")}
                    >
                      <i className="ri-home-line mr-1"></i> Home
                    </Button>
                  )}

                  <Button
                    type={currentStep === totalSteps ? "submit" : "button"}
                    onClick={
                      currentStep < totalSteps ? handleNextStep : undefined
                    }
                    className="bg-primary hover:bg-[#3d8c40] font-nunito font-bold"
                    disabled={
                      loading || (currentStep === 1 ? !step1Valid : !step2Valid)
                    }
                  >
                    {loading ? (
                      <span className="flex items-center">
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
                        Processing...
                      </span>
                    ) : currentStep === totalSteps ? (
                      "Start Free Screener"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="bg-neutral/50 p-6 flex flex-col space-y-4">
              <Separator className="bg-text/20" />
              <div className="flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary mr-2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="text-sm font-opensans text-text/80">
                  Your information is secure and will not be shared
                </span>
              </div>
              <p className="text-center text-xs text-text/60 font-opensans">
                By continuing, you agree to our{" "}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Quiz;
