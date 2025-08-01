"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy, Star } from "lucide-react"

interface CelebrationMessageProps {
  show: boolean
  onClose: () => void
}

export function CelebrationMessage({ show, onClose }: CelebrationMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full animate-in zoom-in-95 duration-300">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Star className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -bottom-1 -left-1 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations! 🎉</h2>

          <p className="text-gray-600 mb-6">
            You've successfully completed the onboarding process! Welcome to our amazing platform. You're now ready to
            explore all the incredible features we have to offer.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Exploring
            </Button>

            <p className="text-sm text-gray-500">🚀 Ready to take off? Let's build something amazing together!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
