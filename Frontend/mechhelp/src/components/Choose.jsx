import React from "react";
import car from "../assets/car2.png";
import { ShieldCheck, Clock, Award, Wrench } from "lucide-react";

const Choose = () => {
  const features = [
    {
      title: "Mobile Diagnostics",
      text: "Doorstep computer diagnostic scan at your home or office with full report.",
      icon: <Wrench className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Bodywork & Paint",
      text: "Specialized car dent repair and precision factory color matching.",
      icon: <Award className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Oil, Lube & Filters",
      text: "Complete engine oil flush and filter change to extend vehicle lifespan.",
      icon: <Clock className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Car Detailing",
      text: "Professional interior steam cleaning, restoration, and ceramic polish.",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />
    },
  ];

  return (
    <section className="bg-slate-50 text-slate-900 py-20 px-6 border-b border-slate-200">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Full-Service Care On Demand</h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Certified mechanics, transparent pricing, and real-time map tracking right at your doorstep.
          </p>
        </div>

        <div className="flex justify-center">
          <img src={car} alt="Car" className="max-h-72 object-contain filter drop-shadow-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {features.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 hover:border-blue-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 space-y-4 shadow-xs hover:shadow-md"
            >
              <div className="bg-blue-50 border border-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {service.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Choose;
