import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Wrench, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Car, 
  Zap, 
  ChevronDown, 
  Star, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import carImage from "../assets/car2.png";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const emergencyServices = [
    {
      title: "Flat Tire Service",
      desc: "Instant doorstep or roadside tire patch & spare replacement",
      icon: "🛞",
      tag: "Immediate Dispatch"
    },
    {
      title: "Battery Jumpstart",
      desc: "Fast voltage diagnostic check & high-power boost",
      icon: "⚡",
      tag: "15-Min Arrival"
    },
    {
      title: "Fuel Delivery",
      desc: "Emergency petrol or diesel delivered directly to your vehicle",
      icon: "⛽",
      tag: "On Demand"
    },
    {
      title: "Engine & Towing",
      desc: "Professional vehicle recovery & flatbed transport",
      icon: "🚚",
      tag: "24/7 Available"
    }
  ];

  const mainServices = [
    {
      title: "Computer Diagnostics",
      desc: "Advanced OBD-II scanner checks for engine codes, sensors, and electrical systems at your location.",
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      features: ["Full ECU Scan", "Sensor Diagnostics", "Instant Report"]
    },
    {
      title: "Bodywork & Paint Repair",
      desc: "Showroom-quality dent removal, scratch repair, and computerized color matching.",
      icon: <Car className="w-8 h-8 text-blue-600" />,
      features: ["Scratch Removal", "Factory Color Match", "Rust Treatment"]
    },
    {
      title: "Oil, Lube & Filter Change",
      desc: "Keep your engine running smoothly with premium synthetic oil, fluid top-ups, and filter replacements.",
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      features: ["Synthetic Oil", "Fluid Check", "Filter Replacement"]
    },
    {
      title: "Auto Detailing & Polish",
      desc: "Deep interior steam cleaning, leather restoration, exterior ceramic coating, and paint protection.",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      features: ["Deep Interior Clean", "Paint Protection", "Ceramic Coating"]
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Request Assistance",
      desc: "Select your breakdown issue or maintenance service and share your GPS location.",
      icon: <MapPin className="w-6 h-6 text-white" />
    },
    {
      step: "02",
      title: "Track Live Mechanic",
      desc: "Watch your assigned verified mechanic drive to your exact coordinates in real time.",
      icon: <Clock className="w-6 h-6 text-white" />
    },
    {
      step: "03",
      title: "Get Fixed & Drive",
      desc: "Get repaired on the spot with transparent pricing and instant digital receipts.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Sharma",
      location: "Delhi",
      rating: 5,
      comment: "My car battery died late at night on the highway. MechHelp assigned a mechanic within 2 minutes. He arrived with jumpstart cables in 15 mins. Lifesaver!",
      role: "Verified Driver"
    },
    {
      name: "Ananya Roy",
      location: "Pune",
      rating: 5,
      comment: "Got a flat tire on the way to the airport. The live map tracking showed the mechanic moving in real time. Very transparent and super fast service.",
      role: "Verified Customer"
    },
    {
      name: "Vikram Mehta",
      location: "Mumbai",
      rating: 5,
      comment: "Full doorstep oil change and diagnostic scan done right outside my office. Honest pricing and certified mechanics. Highly recommended!",
      role: "Car Owner"
    }
  ];

  const faqs = [
    {
      q: "How fast does a mechanic arrive after I send a request?",
      a: "Our system instantly pairs you with the closest available certified mechanic. Average arrival time is 15 to 25 minutes depending on traffic and location."
    },
    {
      q: "How does the real-time map tracking work?",
      a: "Once a mechanic accepts your request, a live interactive map opens on your screen. You can track the mechanic's exact GPS location and estimated time of arrival live."
    },
    {
      q: "Are the service prices fixed or estimated?",
      a: "All service rates are transparent with no hidden costs. You receive an upfront estimate before confirming the request."
    },
    {
      q: "What emergency breakdown services are supported?",
      a: "We support flat tire replacement, battery jumpstarts, fuel delivery, engine diagnostics, brake fixes, and towing transport."
    }
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans min-h-screen">
      
      {/* 1. HERO SECTION (SOLID LIGHT THEME - NO GRADIENTS) */}
      <section className="relative bg-white border-b border-slate-200 pt-16 pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-blue-700">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>24/7 Roadside Assistance & Mobile Mechanics</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
              On-Demand Car Repairs. <br />
              <span className="text-blue-600">Right Where You Are.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
              Stuck with a breakdown or need doorstep maintenance? Get certified mechanics dispatched directly to your GPS coordinates with live map tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/layout/nearby-mechanic"
                className="bg-red-600 hover:bg-red-700 text-white text-base font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3 active:scale-98"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Find Nearby Mechanic</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/layout/services"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-base font-semibold px-7 py-4 rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                <span>View All Services</span>
              </Link>
            </div>

            {/* Metrics Counter Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              <div>
                <div className="text-3xl font-extrabold text-slate-900">500+</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Certified Mechanics</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-600">15 Min</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Avg Response Time</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-600">4.9 ★</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full bg-slate-100 border border-slate-200 rounded-3xl p-6 shadow-lg relative">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Live Dispatch Ready</span>
                </div>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-bold">GPS ACTIVE</span>
              </div>

              <div className="flex justify-center my-4">
                <img 
                  src={carImage} 
                  alt="MechHelp Service" 
                  className="max-h-64 object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-500" 
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 text-left space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Fastest Coverage Area</span>
                  <span className="text-emerald-600 font-bold">Nearby Mechanics Active</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. EMERGENCY QUICK SOS CATEGORIES (SOLID LIGHT CARDS) */}
      <section className="bg-slate-50 py-20 px-6 md:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-red-600">Fast Assistance</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Emergency Breakdown Services</h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Select your emergency category for priority mechanic assignment and immediate GPS tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyServices.map((item, idx) => (
              <Link
                key={idx}
                to="/layout/nearby-mechanic"
                className="bg-white border border-slate-200 hover:border-red-600 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 block group shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md group-hover:border-red-600 group-hover:text-red-600 transition-colors">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-6 flex items-center space-x-2 text-xs font-bold text-blue-600 group-hover:text-red-600 transition-colors">
                  <span>Dispatch Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. CORE SERVICES SHOWCASE (SOLID MINIMAL LIGHT CARDS) */}
      <section className="bg-white py-24 px-6 md:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Comprehensive Repairs</div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Full-Service Auto Care</h2>
            </div>
            <p className="text-slate-600 text-base max-w-md">
              From routine oil changes to advanced computer diagnostics, our certified technicians come fully equipped to your location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainServices.map((service, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 hover:border-blue-600 rounded-3xl p-8 transition-all duration-300 hover:shadow-md text-left space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                    {service.icon}
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-md font-bold">
                    SERVICE 0{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                  {service.features.map((feat, fIdx) => (
                    <span 
                      key={fIdx}
                      className="inline-flex items-center space-x-1 text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section className="bg-slate-50 py-24 px-6 md:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16 text-center">
          
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Simple 3-Step Process</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">How MechHelp Works</h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">
              Get back on the road in 3 easy steps with total transparency and real-time tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-md">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-extrabold text-slate-200 font-mono">
                    {step.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="bg-white py-24 px-6 md:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16 text-center">
          
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Verified Reviews</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Trusted by Thousands of Drivers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center space-x-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{t.comment}"
                </p>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <span className="text-xs text-slate-500">{t.role} • {t.location}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-1 rounded-md">
                    VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. FAQS ACCORDION */}
      <section className="bg-slate-50 py-24 px-6 md:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Got Questions?</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 text-lg focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-10 md:p-16 space-y-8 shadow-xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Stuck on the Road right now?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Get instant roadside dispatch with real-time GPS mechanic tracking in under 20 minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/layout/nearby-mechanic"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center space-x-3"
            >
              <AlertTriangle className="w-6 h-6" />
              <span>Request Mechanic Nearby</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}