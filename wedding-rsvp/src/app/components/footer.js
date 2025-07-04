import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-stone-50 pt-10 pb-16 mt-auto">
      {/* Golden divider line */}
      <div className="w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 opacity-80 mb-10"></div>

      <div className="max-w-6xl mx-auto flex justify-between items-center px-10 md:flex-row flex-col md:gap-0 gap-8">
        {/* Footer text content */}
        <div className="text-center flex-1">
          <h2 className="text-4xl text-gray-500 font-light mb-3 font-serif md:text-4xl text-3xl">
            Amy and Corey Wedding 2026
          </h2>
          <p className="text-base text-gray-600 font-light mb-2">
            All rights reserved
          </p>
          <p className="text-sm text-gray-400 font-light">
            2025-2026 by Roland and Maytayo
          </p>
        </div>

        {/* Flower SVG placeholder */}
        <div className="w-48 h-36 flex justify-center items-center md:w-48 md:h-36 w-36 h-28">
          {/* Flower SVG will be added here */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
