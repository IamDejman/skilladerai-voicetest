import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  // Fetch platform statistics
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['/api/statistics'],
    refetchOnWindowFocus: false
  });

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const top = (targetElement as HTMLElement).offsetTop - 80;
        window.scrollTo({
          top,
          behavior: 'smooth'
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center gradient-bg">
        <div className="striped-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-nunito font-bold text-white leading-tight mb-6 max-w-4xl">
              Customer Service Skills Assessment with <span className="text-white/90">skilladder AI</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl">
              Evaluate communication skills, problem-solving ability, and customer service readiness. Trusted by leading companies for quality hiring.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/quiz" className="px-8 py-4 bg-white text-black font-nunito font-semibold text-lg rounded-full transition-colors text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Start Assessment <span className="ml-2">→</span>
              </Link>
              <a href="#how-it-works" className="px-8 py-4 text-white font-nunito font-semibold text-lg transition-colors text-center flex items-center hover:underline">
                Learn More <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-nunito font-bold text-text mb-4">Why Choose skilladder AI</h2>
            <p className="text-lg font-opensans text-text opacity-70 max-w-2xl mx-auto">
              Our AI-powered platform provides detailed analysis of your English speaking skills with actionable feedback
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="ri-robot-2-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-nunito font-bold text-xl mb-2">AI-Powered Assessment</h3>
              <p className="font-opensans text-text opacity-80">
                Advanced AI technology evaluates your pronunciation, intonation, and fluency with human-like precision
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <i className="ri-file-chart-line text-2xl text-secondary"></i>
              </div>
              <h3 className="font-nunito font-bold text-xl mb-2">CEFR Proficiency Rating</h3>
              <p className="font-opensans text-text opacity-80">
                Get evaluated against international standards from beginner (A1) to mastery (C2) levels
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <i className="ri-feedback-line text-2xl text-accent"></i>
              </div>
              <h3 className="font-nunito font-bold text-xl mb-2">Detailed Feedback</h3>
              <p className="font-opensans text-text opacity-80">
                Receive specific suggestions to improve pronunciation, grammar, vocabulary, and fluency
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="ri-sound-module-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-nunito font-bold text-xl mb-2">Accent Neutrality Analysis</h3>
              <p className="font-opensans text-text opacity-80">
                Get insights on your accent characteristics and learn techniques to adjust for clearer communication
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <i className="ri-line-chart-line text-2xl text-secondary"></i>
              </div>
              <h3 className="font-nunito font-bold text-xl mb-2">Progress Tracking</h3>
              <p className="font-opensans text-text opacity-80">
                Monitor your improvement over time with comprehensive analytics and progress reports
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-nunito font-bold text-text mb-4">How It Works</h2>
            <p className="text-lg font-opensans text-text opacity-70 max-w-2xl mx-auto">
              Improve your English speaking skills in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-neutral rounded-xl p-6 shadow-md">
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white font-nunito font-bold text-xl rounded-full flex items-center justify-center">1</span>
                <div className="pt-4">
                  <h3 className="font-nunito font-bold text-xl mb-4">Record Your Speech</h3>
                  <p className="font-opensans text-text opacity-80 mb-4">
                    Complete a short speaking task using our easy-to-use recording tool on any device
                  </p>
                  <div className="h-40 bg-white rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <i className="ri-mic-line text-5xl text-primary mb-2"></i>
                      <p className="text-sm text-text/70 font-opensans">Speak clearly into your microphone</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-neutral rounded-xl p-6 shadow-md">
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white font-nunito font-bold text-xl rounded-full flex items-center justify-center">2</span>
                <div className="pt-4">
                  <h3 className="font-nunito font-bold text-xl mb-4">AI Analysis</h3>
                  <p className="font-opensans text-text opacity-80 mb-4">
                    Our AI processes your speech sample to evaluate pronunciation, fluency, and overall proficiency
                  </p>
                  <div className="h-40 bg-white rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <i className="ri-brain-line text-5xl text-primary"></i>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-secondary rounded-full animate-ping"></div>
                      </div>
                      <p className="text-sm text-text/70 font-opensans">Advanced AI analysis in progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-neutral rounded-xl p-6 shadow-md">
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white font-nunito font-bold text-xl rounded-full flex items-center justify-center">3</span>
                <div className="pt-4">
                  <h3 className="font-nunito font-bold text-xl mb-4">Get Detailed Results</h3>
                  <p className="font-opensans text-text opacity-80 mb-4">
                    Review your personalized assessment report with specific improvement suggestions
                  </p>
                  <div className="bg-white rounded-lg p-3 h-40">
                    <div className="flex justify-between mb-2">
                      <span className="font-nunito font-bold">Pronunciation</span>
                      <span className="text-primary font-bold">85%</span>
                    </div>
                    <div className="w-full bg-neutral/50 rounded-full h-2.5 mb-3">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="font-nunito font-bold">Fluency</span>
                      <span className="text-secondary font-bold">72%</span>
                    </div>
                    <div className="w-full bg-neutral/50 rounded-full h-2.5 mb-3">
                      <div className="bg-secondary h-2.5 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="font-nunito font-bold">Vocabulary</span>
                      <span className="text-accent font-bold">78%</span>
                    </div>
                    <div className="w-full bg-neutral/50 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/quiz" className="inline-block px-8 py-4 bg-primary hover:bg-[#3d8c40] text-white font-nunito font-bold text-lg rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-nunito font-bold text-text mb-4">What Our Users Say</h2>
            <p className="text-lg font-opensans text-text opacity-70 max-w-2xl mx-auto">
              Join thousands of satisfied users who have improved their English speaking skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" alt="User testimonial" className="w-12 h-12 rounded-full" />
                  <div className="ml-3">
                    <h4 className="font-nunito font-bold">Sarah Johnson</h4>
                    <p className="text-sm opacity-70">Marketing Manager</p>
                  </div>
                </div>
                <div className="flex text-accent">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="font-opensans text-text opacity-80">
                "skilladder AI helped me improve my presentation skills dramatically. The accent feedback was eye-opening, and I now feel more confident during client meetings."
              </p>
            </div>
            
            <div className="bg-neutral rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=100&h=100" alt="User testimonial" className="w-12 h-12 rounded-full" />
                  <div className="ml-3">
                    <h4 className="font-nunito font-bold">Rafael Santos</h4>
                    <p className="text-sm opacity-70">Software Engineer</p>
                  </div>
                </div>
                <div className="flex text-accent">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-half-fill"></i>
                </div>
              </div>
              <p className="font-opensans text-text opacity-80">
                "As a non-native speaker working in tech, clear communication is essential. The specific pronunciation tips have been invaluable for my daily standup meetings."
              </p>
            </div>
            
            <div className="bg-neutral rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=100&h=100" alt="User testimonial" className="w-12 h-12 rounded-full" />
                  <div className="ml-3">
                    <h4 className="font-nunito font-bold">Aisha Rahman</h4>
                    <p className="text-sm opacity-70">Graduate Student</p>
                  </div>
                </div>
                <div className="flex text-accent">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="font-opensans text-text opacity-80">
                "Preparing for my university interviews was stressful, but practicing with skilladder AI gave me the confidence I needed. I'm now studying at my dream school!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-nunito font-bold text-white mb-6">Ready to Transform Your English Speaking Skills?</h2>
          <p className="text-xl font-opensans text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users worldwide who have improved their pronunciation and confidence with skilladder AI
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/quiz" className="px-8 py-4 bg-white text-primary font-nunito font-bold text-lg rounded-full transition-colors shadow-lg hover:shadow-xl">
              Start Your Free Assessment
            </Link>
            <a href="#how-it-works" className="px-8 py-4 bg-[#3d8c40] hover:bg-[#3d8c40]/80 text-white font-nunito font-bold text-lg rounded-full transition-colors text-center border-2 border-white shadow-lg hover:shadow-xl">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-nunito font-bold text-primary mb-2">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  statistics?.formattedUserCount || '10,000+'
                )}
              </div>
              <p className="text-lg font-opensans text-text opacity-80">Users Worldwide</p>
            </div>
            
            <div>
              <div className="text-4xl font-nunito font-bold text-primary mb-2">6</div>
              <p className="text-lg font-opensans text-text opacity-80">CEFR Levels Assessed</p>
            </div>
            
            <div>
              <div className="text-4xl font-nunito font-bold text-primary mb-2">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  statistics?.rating ? `${statistics.rating}/5` : '4.8/5'
                )}
              </div>
              <p className="text-lg font-opensans text-text opacity-80">Average User Rating</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;