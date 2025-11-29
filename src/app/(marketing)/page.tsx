'use client';
import React from 'react';
import { 
  Drone, 
  ShieldCheck, 
  Box, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  Play,
  Menu,
  Layers
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // IMPROVEMENT: Import Link
import { signInPath, signUpPath } from '@/path';

import { useAuth } from "@/features/auth/hooks/use-auth";
import { AccountDropdown } from '../(saas)/_navigation/account-dropdown';



const Home = () => {
  const {user, isFetched}= useAuth( );
  if(!isFetched){
        return null;
    }

  const navItem= user ? (
        <AccountDropdown user={user} />
        
    ) : (<><button className="hidden md:block text-slate-900 dark:text-slate-200 font-medium text-sm hover:underline">
                    <Link href={signInPath()} >Log in</Link>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition">
                    <Link href={signUpPath()} >Get Started</Link>
            </button></>)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-200">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">AI4Safety</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
                <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition">How it Works</a>
                <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
                </div>
                <div className="flex items-center gap-4">
                  {navItem}
                {/* <YourExistingDarkModeToggle /> */}
                <button className="md:hidden p-2 text-slate-900 dark:text-slate-200">
                    <Menu className="w-6 h-6" />
                </button>
                </div>
        </nav>
      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
          {/* IMPROVEMENT: Optimized Background Image using Next/Image */}
          <div className="absolute inset-0 -z-10">
            <Image 
              src="/drone_survey.png"
              alt="Drone survey background"
              fill
              style={{ objectFit: 'cover' }}
              priority // Loads immediately for LCP score
              quality={85}
            />
             {/* Dark mode friendly overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide dark:bg-blue-900/30 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                v2.0 Now Live with 3D Tiles
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Automate Safety Inspections with <span className="text-blue-600 dark:text-blue-400">AI Precision.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Transform drone imagery into 3D digital twins. Detect structural defects and safety violations instantly using our proprietary computer vision models.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-base font-bold transition flex items-center justify-center gap-2">
                  Start Free Inspection <ArrowRight className="w-4 h-4" />
                </button>
                <button className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full text-base font-bold transition flex items-center justify-center gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600">
                  <Play className="w-4 h-4 fill-slate-700 dark:fill-slate-200" /> Watch Demo
                </button>
              </div>
              <div className="pt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-700" />
                  ))}
                </div>
                <p>Trusted by 200+ Safety Officers</p>
              </div>
            </div>
            
            {/* 3D Viewer Mockup */}
            <div className="relative">
              {/* Background glow - adjusted opacity */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl transform rotate-2 blur-lg opacity-70 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
              
              {/* Image Container - REMOVED aspect-[4/3] and REMOVED bg-slate-950 */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Image
                  width={1200}  // Use high res width
                  height={800}  // Use high res height (defines the natural aspect ratio)
                  src="/cesium_tilset.png"
                  alt="AI4Safety 3D Viewer with AI Detections"
                  className="w-full h-auto" // This ensures it fills width and adjusts height automatically
                  priority
                />
              </div>
            </div>
          </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to secure your site</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Replace manual checklists with automated intelligence. Our platform handles the heavy lifting from data collection to final reporting.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-slate-800/50 transition group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Drone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Drone & Mobile Capture</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload images from any drone (DJI, Autel) or use our mobile app. We process the data into orthomosaics and 3D models automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-slate-800/50 transition group">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Layers className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3D Digital Twins</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualize your site in high-fidelity 3D. Measure distances, areas, and volumes directly on the digital twin using our Cesium-powered viewer.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-slate-800/50 transition group">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Defect Detection</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI spots rust, cracks, leaks, and missing PPE automatically. Receive severity scores and generate compliance reports in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                    <div className="space-y-12">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Your Data</h3>
                                <p className="text-slate-600 dark:text-slate-400">Drag and drop drone imagery or connect your CCTV feed directly to our secure cloud dashboard.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Processing & Reconstruction</h3>
                                <p className="text-slate-600 dark:text-slate-400">Our engine runs photogrammetry to build 3D models while simultaneously scanning for over 50+ types of safety hazards.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Act on Insights</h3>
                                <p className="text-slate-600 dark:text-slate-400">Access the interactive 3D map, annotate issues, assign tasks to your maintenance team, and export PDF reports.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 h-full min-h-[400px] flex items-center justify-center">
                    <div className="text-slate-400 dark:text-slate-500 text-center">
                        <Box className="w-24 h-24 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">Interactive Dashboard Preview</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-blue-900 text-white rounded-t-[3rem] mt-12 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight dark:text-white">Ready to modernize your inspection workflow?</h2>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto dark:text-blue-300">Join forward-thinking facility managers and safety officers saving 40% of their inspection time.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="bg-white text-blue-900 px-8 py-4 rounded-full text-base font-bold hover:bg-blue-50 transition dark:bg-slate-200 dark:hover:bg-slate-50">
                Start Your Free Trial
              </button>
              <button className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-white/10 transition">
                Schedule a Demo
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-blue-300">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No credit card required</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cancel anytime</span>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <ShieldCheck className="text-white w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold text-white">AI4Safety</span>
                </div>
                <p className="text-sm">Empowering industrial safety through artificial intelligence and spatial computing.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                {/* IMPROVEMENT: Used Link components instead of a tags */}
                <ul className="space-y-2 text-sm">
                    <li><Link href="/features" className="hover:text-white">Features</Link></li>
                    <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                    <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                    <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                    <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="https://linkedin.com" className="hover:text-white">LinkedIn</Link></li>
                    <li><Link href="https://twitter.com" className="hover:text-white">Twitter</Link></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 dark:border-slate-700 text-center text-xs">
            &copy; 2025 AI4Safety. All rights reserved. Built in Morocco.
        </div>
      </footer>
    </div>
  );
};

export default Home;