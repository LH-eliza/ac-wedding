'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function WeddingInvitation() {
  const [daysUntil, setDaysUntil] = useState('890 Days To Go Until');

  useEffect(() => {
    const updateDaysCounter = () => {
      const weddingDate = new Date('2026-05-29');
      const today = new Date();
      const timeDifference = weddingDate.getTime() - today.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
      if (daysDifference > 0) {
        setDaysUntil(`${daysDifference} Days To Go Until`);
      } else if (daysDifference === 0) {
        setDaysUntil('Today is the day!');
      } else {
        setDaysUntil('Happily married!');
      }
    };

    updateDaysCounter();
    const interval = setInterval(updateDaysCounter, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRSVP = () => {
    // In a real app, you'd navigate to RSVP page or open a modal
    alert('RSVP functionality would redirect to your RSVP form/page');
  };

  const showSection = (section) => {
    // In a real app, you'd use Next.js router or state management
    alert(`${section.toUpperCase()} section would be displayed here`);
  };

  const SVGPlaceholder = ({ id, children, className = "", delay = "0s" }) => (
    <div 
      id={id}
      className={`svg-placeholder floating cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-lg ${className}`}
      style={{ animationDelay: delay }}
      onClick={() => console.log(`Clicked SVG placeholder: ${id}`)}
    >
      {children}
    </div>
  );

  const decor = {
    topLeft: '/decoration/top-left.svg',
    topCenter: '/decoration/top-center.svg',
    topRight: '/decoration/top-right.svg',
    leftEdge: '/decoration/left-edge.svg',
    rightEdge: '/decoration/right-edge.svg',
    bottomLeft: '/decoration/bottom-left.svg',
    bottomCenter: '/decorations/bottom-line-center.svg',
    bottomRight: '/decoration/bottom-right.svg',
  };

  return (
    <>
      <Head>
        <title>Amy & Corey Wedding</title>
        <meta name="description" content="Wedding invitation for Amy & Corey - May 29, 2026 in Ottawa, Ontario" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
      </Head>

      <div className="bg-cream min-h-screen font-serif flex items-center justify-center">
        {/* Main Wedding Invitation Card */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-cream to-amber-50 rounded-lg overflow-hidden fade-in">
            
            {/* Top Border with Decorative Elements */}
            <div className="relative w-full h-16 md:h-24">
              {/* Top Left Corner SVG Placeholder */}
              <SVGPlaceholder 
                id="top-left-corner" 
                className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24"
                delay="0s"
              >
                <img src={decor.topLeft} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Top Center Decorative Line */}
              <SVGPlaceholder 
                id="top-center-line" 
                className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 w-48 md:w-64"
              >
                <img src={decor.topCenter} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Top Right Corner SVG Placeholder */}
              <SVGPlaceholder 
                id="top-right-corner" 
                className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24"
                delay="1s"
              >
                <img src={decor.topRight} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
            </div>
            
            {/* Main Content Area */}
            <div className="px-8 md:px-16 py-8 md:py-12 text-center relative">
              {/* Left Edge Decorations */}
              <SVGPlaceholder 
                id="left-edge" 
                className="absolute left-2 md:left-4 top-1/4 w-10 md:w-14 h-32 md:h-40"
                delay="0.5s"
              >
                <img src={decor.leftEdge} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Right Edge Decorations */}
              <SVGPlaceholder 
                id="right-edge" 
                className="absolute right-2 md:right-4 top-1/4 w-10 md:w-14 h-32 md:h-40"
                delay="1.5s"
              >
                <img src={decor.rightEdge} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Days Until Counter */}
              <p className="text-sm md:text-base text-[#A8BA95] mb-4 md:mb-6 font-light tracking-wide fade-in animate-fade-in">
                {daysUntil}
              </p>
              
              {/* Couple Names */}
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#829172] mb-2 md:mb-4 fade-in animate-fade-in">
              <span className="inline-block">AMY</span> 
              <span className="text-3xl md:text-5xl lg:text-6xl text-[#829172] inline-block mx-2 md:mx-4">&</span> 
              <span className="inline-block">COREY</span>
              </h1>
              
              {/* Wedding Date and Location */}
              <p className="text-sm md:text-base text-[#A8BA95] mb-8 md:mb-12 tracking-[0.35em] font-light fade-in animate-fade-in">
                MAY 29, 2026 • OTTAWA, ONTARIO
              </p>
              
              {/* RSVP Button */}
              <div className="mb-8 md:mb-12 fade-in animate-fade-in">
                <button 
                  onClick={handleRSVP}
                  className="rsvp-button inline-block text-white px-10 md:px-12 py-3 md:py-3 rounded-lg text-lg md:text-xl font-serif tracking-[0.08em] transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#829172] bg-[#A8BA95]"
                >
                  RSVP
                </button>
              </div>
            </div>
            
            {/* Bottom Border with Decorative Elements */}
            <div className="relative w-full h-16 md:h-24">
              {/* Bottom Left Corner SVG Placeholder */}
              <SVGPlaceholder 
                id="bottom-left-corner" 
                className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24"
                delay="2s"
              >
                <img src={decor.bottomLeft} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Bottom Center Decorative Line */}
              <SVGPlaceholder 
                id="bottom-center-line" 
                className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 w-48 md:w-64"
              >
                <img src={decor.bottomCenter} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
              
              {/* Bottom Right Corner SVG Placeholder */}
              <SVGPlaceholder 
                id="bottom-right-corner" 
                className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24"
                delay="2.5s"
              >
                <img src={decor.bottomRight} alt="" className="w-full h-full object-contain" />
              </SVGPlaceholder>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="max-w-4xl mx-auto mt-8 md:mt-12 fade-in animate-fade-in">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base">
              {['home', 'story', 'photos', 'qa', 'travel', 'registry'].map((section) => (
                <button
                  key={section}
                  onClick={() => showSection(section)}
                  className="nav-link text-gray-600 hover:text-sage-green transition-colors duration-300 font-medium tracking-wide py-2 relative overflow-hidden group"
                >
                  {section === 'qa' ? 'Q&A' : section === 'travel' ? 'TRAVEL & STAY' : section.toUpperCase()}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-sage-green transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <style jsx>{`
          .bg-cream {
            background-color: #FEF9F0;
          }
          
          .text-sage-green {
            color: #9CAF88;
          }
          
          .bg-sage-green {
            background-color: #9CAF88;
          }
          
          .bg-sage-dark {
            background-color: #7A8A6B;
          }
          
          .from-sage-green {
            --tw-gradient-from: #9CAF88;
          }
          
          .to-sage-dark {
            --tw-gradient-to: #7A8A6B;
          }
          
          .ring-sage-green {
            --tw-ring-color: #9CAF88;
          }
          
          .font-serif {
            font-family: 'Libre Baskerville', serif;
          }
          
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          .fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .floating {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .svg-placeholder {
            transition: all 0.3s ease-in-out;
          }
          
          .svg-placeholder:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          }
        `}</style>
      </div>
    </>
  );
}