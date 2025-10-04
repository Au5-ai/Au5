"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-gradient">
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="white/90 text-sm font-medium">
                Welcome to your workspace
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Hello, there! 👋
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light">
              Lets get you started with the essentials
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
