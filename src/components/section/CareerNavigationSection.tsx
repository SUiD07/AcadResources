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
            Resoures for career planning, job searching, and skill development
            to help you navigate your career path effectively.
          </p>
        </div>
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
