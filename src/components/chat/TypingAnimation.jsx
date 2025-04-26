import React from 'react';
import Logo from "../../assets/CaseMap logo.png";

const TypingAnimation = () => {
  return (
    <div className="flex items-start mb-4">
      <img
        src={Logo}
        alt="Robot"
        className="w-12 h-12 rounded-full p-2 outline-1 mt-1 mr-4 outline outline-gray-200 hidden sm:block"
      />
      <div className="max-w-[80%] rounded-lg break-words p-4 bg-white">
        <div className="typing-animation">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingAnimation;
