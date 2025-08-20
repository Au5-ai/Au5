import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
              ✨ AI-Powered Transcription
            </Badge>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Turn your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  meetings
                </span>{" "}
                into insights
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Get accurate transcripts, AI-powered summaries, and actionable
                insights from every meeting. Works with Zoom, Teams, Google
                Meet, and more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">
                Download Chrome Extension
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Always free</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-2xl">
              {/* Mock Interface */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-slate-600">
                      Meeting Transcript
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      JS
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        John Smith
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        "Let's review our Q4 strategy and discuss the new
                        product launch timeline..."
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">2:14</span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      AD
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Alice Davis
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        "I think we should prioritize the mobile experience
                        first..."
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">2:42</span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-900">
                      AI Summary
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Key decisions: Focus on mobile-first approach, Q4 launch
                      timeline confirmed for December 15th
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
