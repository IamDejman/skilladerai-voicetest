import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PrivacyPolicyPage() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-12">
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="font-nunito">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold font-nunito mb-6">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert prose-headings:font-nunito prose-p:font-opensans max-w-none">
            <p className="lead">
              At skilladder AI, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
            </p>
            
            <h2>1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, phone number, and location when you register for our services.</li>
              <li><strong>Speech Recordings:</strong> Audio recordings submitted for assessment purposes.</li>
              <li><strong>Assessment Data:</strong> Results, scores, and feedback from language assessments.</li>
              <li><strong>Technical Information:</strong> Device information, IP address, browser type, and cookies when you access our services.</li>
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide and improve our speech assessment services</li>
              <li>Process and analyze your speech recordings</li>
              <li>Generate personalized feedback and recommendations</li>
              <li>Maintain and enhance the functionality of our platform</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
            
            <h2>3. Data Processing and AI Analysis</h2>
            <p>
              Our service uses artificial intelligence to analyze speech recordings and provide assessment results. Your speech data is processed using:
            </p>
            <ul>
              <li>Speech recognition technology to transcribe audio</li>
              <li>Machine learning models to assess language proficiency</li>
              <li>Natural language processing to generate feedback</li>
            </ul>
            <p>
              We retain processed speech data for a limited time to improve our AI models, after which it is anonymized or deleted.
            </p>
            
            <h2>4. Data Sharing and Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal information with third parties. We may share data with:
            </p>
            <ul>
              <li>Service providers who help us deliver our services (e.g., cloud hosting, AI processing)</li>
              <li>Analytics providers to help us understand how our services are used</li>
            </ul>
            <p>
              All third parties are required to respect the security of your personal information and treat it according to applicable laws.
            </p>
            
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights regarding your personal information, including:
            </p>
            <ul>
              <li>Accessing your personal information</li>
              <li>Correcting inaccurate or incomplete information</li>
              <li>Requesting deletion of your information</li>
              <li>Withdrawing consent for data processing</li>
              <li>Objecting to certain processing activities</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>
            
            <h2>7. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have different data protection laws. When we transfer your information, we will take appropriate safeguards to ensure your information remains protected.
            </p>
            
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
            
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@skilladderai.com.
            </p>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Last updated: May 22, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}