import React from "react";
import { motion } from "framer-motion";
import CaseMapLogo from "../assets/CaseMap logo.png"; // Update the path to your logo

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen relative overflow-hidden bg-primary">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Logo and text */}
      <div className="relative flex items-center space-x-4 p-6 rounded-xl backdrop-blur-lg bg-opacity-30">
        <img src={CaseMapLogo} alt="CaseMap logo" className="w-16 h-16" />
        <motion.h1
          className="text-4xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          CaseMap
        </motion.h1>
      </div>
    </div>
  );
};

export default Loading;
