'use client';

import { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Droplets, 
  Heart, 
  CreditCard, 
  Package, 
  Smartphone, 
  Check,
  Star,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
  BarChart3,
  Shield,
  Users,
  Cog as Cow,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import sections that aren't needed for initial render
const FeaturesSection = lazy(() => import('@/components/home/features-section'));
const PricingSection = lazy(() => import('@/components/home/pricing-section'));
const Footer = lazy(() => import('@/components/home/footer'));

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-emerald-600" />,
      title: "Milk Production Tracking",
      description: "Monitor daily milk yields, track production trends, and optimize output with detailed analytics."
    },
    {
      icon: <Heart className="h-8 w-8 text-emerald-600" />,
      title: "Cattle Health Monitoring",
      description: "Keep comprehensive health records, vaccination schedules, and breeding information for your livestock."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-emerald-600" />,
      title: "Automated Billing",
      description: "Generate invoices, track payments, and manage customer accounts with our integrated billing system."
    },
    {
      icon: <Package className="h-8 w-8 text-emerald-600" />,
      title: "Inventory Management",
      description: "Track feed, medications, equipment, and supplies with automated reorder alerts."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-emerald-600" />,
      title: "Mobile & Desktop Support",
      description: "Access your dairy data anywhere with our responsive web app and mobile-optimized interface."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-emerald-600" />,
      title: "Advanced Analytics",
      description: "Make informed decisions with detailed reports, forecasting, and performance insights."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small dairy operations",
      features: [
        "Up to 10 cattle records",
        "Basic milk production tracking",
        "Simple health records",
        "Monthly reports",
        "Email support"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "Ideal for growing dairy farms",
      features: [
        "Up to 100 cattle records",
        "Advanced production analytics",
        "Comprehensive health monitoring",
        "Automated billing system",
        "Inventory management",
        "Mobile app access",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale dairy operations",
      features: [
        "Unlimited cattle records",
        "Advanced analytics & forecasting",
        "Multi-location management",
        "API access & integrations",
        "Custom reporting",
        "24/7 dedicated support",
        "On-site training"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 rounded-lg p-2">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-800">DairyTrack</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Home</a>
              <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">About</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Contact</a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href='/dashboard' className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                Sign In
              </Link>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-sm">
              <div className="px-4 py-6 space-y-4">
                <a href="#" className="block text-gray-700 hover:text-emerald-600 transition-colors font-medium">Home</a>
                <a href="#features" className="block text-gray-700 hover:text-emerald-600 transition-colors font-medium">Features</a>
                <a href="#pricing" className="block text-gray-700 hover:text-emerald-600 transition-colors font-medium">Pricing</a>
                <a href="#" className="block text-gray-700 hover:text-emerald-600 transition-colors font-medium">About</a>
                <a href="#" className="block text-gray-700 hover:text-emerald-600 transition-colors font-medium">Contact</a>
                <div className="pt-4 space-y-3">
                  <Button variant="ghost" className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                    Sign In
                  </Button>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex">
          <div className="max-w-xl mx-auto text-center">
            <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
              <Star className="h-4 w-4 mr-1" />
              Trusted by 500+ dairy farms
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify Your{' '}
              <span className="text-emerald-600 relative">
                Dairy Operations
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Efficient livestock tracking, milk production records, billing, and more — all in one place. 
              Transform your dairy farm with modern management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>
          </div>

              <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-emerald-100 rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Today's Production</h3>
                    <Cow className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">2,450L</div>
                  <div className="text-sm text-gray-600">+12% from yesterday</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-sm text-gray-600">Active Cattle</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">98%</div>
                    <div className="text-sm text-gray-600">Health Score</div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Lazy load the Features, Pricing, and Footer sections */}
      <Suspense fallback={<div className="py-20 text-center">Loading features...</div>}>
        <FeaturesSection features={features} />
      </Suspense>

      <Suspense fallback={<div className="py-20 text-center">Loading pricing plans...</div>}>
        <PricingSection pricingPlans={pricingPlans} />
      </Suspense>
      
      <Suspense fallback={<div className="py-10 text-center">Loading footer...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}