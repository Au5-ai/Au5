"use client";

import React from "react";
import {
  UserCircle,
  Compass,
  BookOpen,
  Sparkles,
  ArrowRight,
  Activity,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";

export default function PlaygroundPage() {
  const recommendedSpaces = [
    {
      title: "Complete Your Profile",
      description:
        "Add your details and preferences to personalize your experience",
      icon: UserCircle,
      color: "from-blue-500 to-cyan-500",
      action: "Set up profile",
    },
    {
      title: "Explore Features",
      description: "Discover all the powerful tools available to you",
      icon: Compass,
      color: "from-purple-500 to-pink-500",
      action: "Start exploring",
    },
    {
      title: "Documentation",
      description: "Learn how to make the most of the platform",
      icon: BookOpen,
      color: "from-orange-500 to-red-500",
      action: "View guides",
    },
    {
      title: "Add AI Tools",
      description: "Customize your AI Tools",
      icon: Brain,
      color: "from-green-500 to-emerald-500",
      action: "Open AI Tools",
    },
    {
      title: "Recent Meeting",
      description: "Stay updated with your latest meeting",
      icon: Activity,
      color: "from-indigo-500 to-blue-500",
      action: "View Meeting",
    },
    {
      title: "Getting Started",
      description: "Take a guided tour to learn the basics",
      icon: Sparkles,
      color: "from-yellow-500 to-amber-500",
      action: "Start tour",
    },
  ];

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
