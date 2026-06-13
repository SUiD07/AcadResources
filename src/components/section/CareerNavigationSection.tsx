import { Heart } from "lucide-react";
import React from "react";

function CareerNavigationSection() {
  return (
    <>
      <div className="pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-slate-900 text-[24px] font-bold">
              Carreer Navigation
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Guidance and resources for your medical career journey
          </p>
        </div>
        {/* Special Thanks */}
        <div className="flex items-start gap-4 bg-pink-50 border border-pink-200 rounded-2xl p-6">
          <div className="w-10 h-10 bg-[#E5007D] rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-[#E5007D] font-semibold">Special Thanks</p>
            <p className="text-slate-600 mt-1">
              This section is being developed by{" "}
              <span className="font-semibold text-slate-800">
                P'Goody, MDCU 77
              </span>
              <div>
                Thank you for your dedication to helping every generation
                navigate their medical career with confidence.
              </div>
            </p>
          </div>
        </div>
        <br />
        <iframe
          src="https://script.google.com/a/macros/docchula.com/s/AKfycbzLW3UuSljfe5tDJghzfOvfBgh-k9yrm_RNwQ12myPPk1Ti4Td9g6RDosFZeTUxVGeaMw/exec"
          width="100%"
          height="800"
        ></iframe>
      </div>
    </>
  );
}

export default CareerNavigationSection;
