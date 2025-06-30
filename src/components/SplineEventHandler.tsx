import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Play, Zap, Target, Compass } from 'lucide-react'
import { LifeGoalsModal } from './LifeGoalsModal'

interface SplineEvent {
  type: string
  payload: {
    number?: number
    action?: string
    buttonId?: string
    scene_id?: string
    ui_type?: string
    [key: string]: any
  }
  timestamp: string
  source: string
}

interface SplineEventHandlerProps {
  onEventReceived?: (event: SplineEvent) => void
}

export const SplineEventHandler: React.FC<SplineEventHandlerProps> = ({ onEventReceived }) => {
  const [events, setEvents] = useState<SplineEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<SplineEvent | null>(null)
  const [showLifeGoalsModal, setShowLifeGoalsModal] = useState(false)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)

  useEffect(() => {
    // Subscribe to Spline events via Supabase Realtime
    const channel = supabase.channel('spline-events')
    
    channel
      .on('broadcast', { event: 'spline_interaction' }, (payload) => {
        const event = payload.payload as SplineEvent
        console.log('Received Spline event:', event)
        
        setEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
        setCurrentEvent(event)
        
        // Handle different types of Spline interactions
        if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') {
          // This is the "Set a goal" interaction - show welcome message
          setShowWelcomeMessage(true)
          // Auto-hide after 8 seconds
          setTimeout(() => {
            setShowWelcomeMessage(false)
          }, 8000)
        } else if (event.payload.number === 1 || !event.payload.scene_id) {
          // This is the original life goals modal interaction
          setShowLifeGoalsModal(true)
        }
        
        // Call the optional callback
        onEventReceived?.(event)
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onEventReceived])

  const closeModal = () => {
    setShowModal(false)
    setCurrentEvent(null)
  }

  const handleLifeGoalSubmit = (goal: string) => {
    console.log('Life goal submitted:', goal)
    // Here you could save the goal to Supabase database
    // For now, we'll just log it and show a success message
    
    // You could also trigger another Spline animation or update the 3D scene
    // based on the submitted goal
  }

  const getEventIcon = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') return <Target className="w-6 h-6" />
    if (event.payload.number === 1) return <Play className="w-6 h-6" />
    if (event.payload.action) return <Zap className="w-6 h-6" />
    return <Sparkles className="w-6 h-6" />
  }

  const getEventTitle = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') return "欢迎启航"
    if (event.payload.number === 1) return "Animation Triggered!"
    if (event.payload.action) return `Action: ${event.payload.action}`
    return "Spline Interaction"
  }

  const getEventDescription = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') {
      return "欢迎启航 - 传感器监测已激活"
    }
    
    const parts = []
    if (event.payload.number) parts.push(`Number: ${event.payload.number}`)
    if (event.payload.buttonId) parts.push(`Button: ${event.payload.buttonId}`)
    if (event.payload.action) parts.push(`Action: ${event.payload.action}`)
    if (event.payload.scene_id) parts.push(`Scene: ${event.payload.scene_id}`)
    if (event.payload.ui_type) parts.push(`UI Type: ${event.payload.ui_type}`)
    
    return parts.length > 0 ? parts.join(' • ') : 'Interactive element activated'
  }

  return (
    <>
      {/* Life Goals Modal - Original */}
      <LifeGoalsModal
        isOpen={showLifeGoalsModal}
        onClose={() => setShowLifeGoalsModal(false)}
        onSubmit={handleLifeGoalSubmit}
      />

      {/* Welcome Message - Top Left Corner */}
      {showWelcomeMessage && (
        <div className="fixed top-6 left-6 z-50 max-w-sm animate-in slide-in-from-left duration-700">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-md 
                          border border-blue-400/30 rounded-2xl p-6 shadow-2xl
                          transform transition-all duration-500">
            
            {/* Close button */}
            <button
              onClick={() => setShowWelcomeMessage(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white 
                         transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 
                              bg-gradient-to-br from-blue-400/30 to-cyan-400/20 
                              rounded-full backdrop-blur-sm border border-blue-400/20">
                <Compass className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-white">
                欢迎启航
              </h3>
            </div>

            {/* Welcome Message */}
            <div className="space-y-3 text-white/90 font-inter leading-relaxed">
              <p className="text-sm">
                系统会调用传感器来监测你是否当下在做重要的事情。
              </p>
              <p className="text-sm">
                当你做和目标有关的事情的时候，会吹起不同的意念之风，推进你的小船帮你到达目的地。
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400/40 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400/30 rounded-full blur-sm animate-pulse delay-1000"></div>
            
            {/* Progress bar for auto-hide */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 
                              animate-[shrink_8s_linear_forwards] origin-left"></div>
            </div>
          </div>
        </div>
      )}

      {/* Event History Panel */}
      {events.length > 0 && !showWelcomeMessage && (
        <div className="fixed top-4 left-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 
                        rounded-lg p-4 max-w-sm">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recent Events ({events.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, 5).map((event, index) => (
              <div key={index} className="text-xs text-white/80 bg-white/5 rounded p-2">
                <div className="font-medium">{getEventTitle(event)}</div>
                <div className="text-white/60">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showModal && currentEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 
                          max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-white">
                {getEventIcon(currentEvent)}
                <h2 className="text-xl font-semibold">{getEventTitle(currentEvent)}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-white/80">
              <p className="text-lg">{getEventDescription(currentEvent)}</p>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-white">Event Details:</h3>
                <div className="space-y-1 text-sm">
                  <div>Source: {currentEvent.source}</div>
                  <div>Type: {currentEvent.type}</div>
                  <div>Time: {new Date(currentEvent.timestamp).toLocaleString()}</div>
                </div>
              </div>

              {Object.keys(currentEvent.payload).length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-white">Payload:</h3>
                  <pre className="text-xs text-white/70 overflow-x-auto">
                    {JSON.stringify(currentEvent.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                           transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}