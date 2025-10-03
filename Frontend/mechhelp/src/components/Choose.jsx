import React from "react";
import car from "../assets/car2.png";

const Choose = () => {
  return (
    <div className="min-h-screen flex flex-col ">
      <div className="text-center">
        <h1 className="text-black font-bold text-6xl">Why to choose us?</h1>
        <p className="text-3xl mt-4">We offer full service and maintenance</p>
        <div className="flex justify-center">
          <img src={car} alt="Car" className="max-w-full h-auto mt-4" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center md:justify-evenly mt-8">
          {[
            {
              
              title: "Diagnostics",
              text: "If your car needs a mobile diagnostic check done at your home or office, let MechHelp come to you.",
            },
            {
              title: "Dent and Paint",
              text: "MechHelp specializes in car dent repair and car painting services for a range of models.",
            },
            {
              title: "Oil/Lube/Filters",
              text: "MechHelp proudly serves the Lube, Oil & Filter change needs of customers' vehicle performance while extending the life of your vehicle.",
            },
            {
              title: "Detailing",
              text: "MechHelp offers professional car detail services at an affordable price. Our interior cleaning, detailing, and restoration services can help you recapture that new car look and smell.",
            },
          ].map((service, index) => (
            <div
              key={index}
              className="w-64 h-64  bg-black rounded-2xl font-medium text-white p-4 flex flex-col hover:scale-105 transition-transform duration-300 "
            >
              <h2 className="text-blue-500 font-bold text-2xl mt-2">
                {service.title}
              </h2>
              <p className="mt-3 flex-grow">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Choose;
