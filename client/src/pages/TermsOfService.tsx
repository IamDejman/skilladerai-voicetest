import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold font-nunito mb-6">Terms of Service</h1>
          
          <div className="prose dark:prose-invert prose-headings:font-nunito prose-p:font-opensans max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using skilladder AI's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              skilladder AI provides English language assessment services, including but not limited to spoken language evaluation, accent analysis, and personalized feedback.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              Some parts of our service may require you to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              When you submit speech recordings or other content to our service, you grant skilladder AI a non-exclusive, worldwide, royalty-free license to use, reproduce, and process that content solely for the purpose of providing and improving our services.
            </p>
            
            <h2>5. Privacy</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our services, you consent to the data practices described in our Privacy Policy.
            </p>
            
            <h2>6. Prohibited Activities</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use our services for any illegal purpose</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Attempt to gain unauthorized access to our services or related systems</li>
              <li>Submit content that is offensive, harmful, or violates the rights of others</li>
            </ul>
            
            <h2>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of our services, including but not limited to text, graphics, logos, and software, are owned by skilladder AI or its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, skilladder AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in any way connected with your use of our services.
            </p>
            
            <h2>9. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, our services with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
            
            <h2>10. Modifications to Terms</h2>
            <p>
              We may revise these Terms of Service at any time by updating this page. Your continued use of our services after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
            
            <h2>11. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which skilladder AI operates, without regard to its conflict of law provisions.
            </p>
            
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@skilladderai.com.
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