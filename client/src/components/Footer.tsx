import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="gradient-bg text-white py-12 px-4 sm:px-6 lg:px-8 mt-0 relative">
      <div className="striped-overlay"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/logo-nobackground.png" alt="skilladder AI Logo" className="h-10 w-auto mr-2" />
              <span className="text-white font-montserrat font-semibold text-xl">skilladder AI</span>
            </div>
            
            <h3 className="font-nunito font-bold text-lg mb-4">Site map</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors">Terms of service</Link></li>
              <li><Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors">Privacy policy</Link></li>
              <li><a href="mailto:support@skilladderai.com" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors">Contact us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-nunito font-bold text-lg mb-4">Social media</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors flex items-center">
                  <i className="ri-twitter-fill text-xl mr-2"></i>
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors flex items-center">
                  <i className="ri-linkedin-fill text-xl mr-2"></i>
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="font-nunito font-semibold text-white/80 hover:text-white transition-colors flex items-center">
                  <i className="ri-instagram-fill text-xl mr-2"></i>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-nunito font-bold text-lg mb-4">Let's get in touch</h3>
            <p className="font-nunito text-white/80 mb-4">
              Email us at <a href="mailto:support@skilladder.ai" className="underline hover:text-white">support@skilladder.ai</a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-6">
          <p className="font-opensans text-white/60 text-sm">
            Skilladder.ai may use cookies and access your device for personalisation purposes. For more, check out our <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Privacy Policy</Link>.
          </p>
          <p className="font-opensans text-white/60 text-sm mt-4">
            © {new Date().getFullYear()} Skilladder AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
