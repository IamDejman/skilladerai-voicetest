import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHomePage = location === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'gradient-bg shadow-lg py-2' : isHomePage ? 'bg-transparent py-3' : 'gradient-bg shadow-lg py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo-nobackground.png" alt="skilladder AI Logo" className="h-10 w-auto mr-2" />
                <span className="text-white font-montserrat font-semibold text-xl">skilladder AI</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {isHomePage && (
              <>
                <a href="#features" className="font-nunito font-semibold text-white hover:text-white/80 transition-colors">Features</a>
                <a href="#how-it-works" className="font-nunito font-semibold text-white hover:text-white/80 transition-colors">How It Works</a>
              </>
            )}
            {!isHomePage && (
              <Link href="/" className="font-nunito font-semibold text-white hover:text-white/80 transition-colors">Home</Link>
            )}
            <Link href="/login" className="font-nunito font-semibold text-white hover:text-white/80 transition-colors">
              Login
            </Link>
            <Link href="/quiz" className="px-5 py-2 font-nunito font-bold text-black bg-white hover:bg-white/90 rounded-full transition-colors shadow-md hover:shadow-lg">
              {location.includes('quiz') || location.includes('assessment') || location.includes('results') ? 'Dashboard' : 'Start Assessment'}
            </Link>
          </div>
          <div className="flex md:hidden items-center">
            <button 
              onClick={toggleMobileMenu} 
              type="button" 
              className="text-white p-2 rounded-md"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - animated slide down */}
      <div 
        className={`${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} md:hidden absolute w-full bg-gradient-to-r from-[#0f172a] to-[#4a2e41] overflow-hidden transition-all duration-300 ease-in-out shadow-xl`}
      >
        <div className="pt-2 pb-4 space-y-1 px-4">
          {isHomePage && (
            <>
              <a 
                href="#features" 
                className="block py-3 px-4 font-nunito font-semibold text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block py-3 px-4 font-nunito font-semibold text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
            </>
          )}
          {!isHomePage && (
            <Link 
              href="/" 
              className="block py-3 px-4 font-nunito font-semibold text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          )}
          <Link 
            href="/login" 
            className="block py-3 px-4 font-nunito font-semibold text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <div className="py-2">
            <Link 
              href="/quiz" 
              className="block w-full py-3 px-4 mt-2 text-center font-nunito font-bold text-black bg-white hover:bg-white/90 rounded-md shadow-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {location.includes('quiz') || location.includes('assessment') || location.includes('results') ? 'Dashboard' : 'Start Assessment'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
