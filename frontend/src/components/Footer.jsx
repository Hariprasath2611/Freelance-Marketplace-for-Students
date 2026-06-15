import React from 'react';
import { Briefcase } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg/60 text-slate-500 dark:text-slate-400 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-primary-500 font-semibold">
          <Briefcase size={16} />
          <span>GradGigs Student Marketplace</span>
        </div>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} GradGigs. Crafted specifically for student freelancers and recruiters.
        </p>
        <div className="flex gap-4 text-xs">
          <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary-500 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
