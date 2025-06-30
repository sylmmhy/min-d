import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Play, Zap, Target, Heart } from 'lucide-react'
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
  const [showSetGoalOverlay, setShowSetGoalOverlay] = useState(false)

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
          // This is the "Set a goal" interaction
          setShowSetGoalOverlay(true)
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

  const handleSetGoalSubmit = (goal: string) => {
    console.log('Set a goal submitted:', goal)
    // Handle the "Set a goal" submission
    // This could be different from the life goals submission
    // For example, you might want to save it to a different table
    // or trigger different animations
  }

  const getEventIcon = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') return <Target className="w-6 h-6" />
    if (event.payload.number === 1) return <Play className="w-6 h-6" />
    if (event.payload.action) return <Zap className="w-6 h-6" />
    return <Sparkles className="w-6 h-6" />
  }

  const getEventTitle = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') return "Set a Goal Triggered!"
    if (event.payload.number === 1) return "Animation Triggered!"
    if (event.payload.action) return `Action: ${event.payload.action}`
    return "Spline Interaction"
  }

  const getEventDescription = (event: SplineEvent) => {
    if (event.payload.scene_id === 'scene_B' || event.payload.ui_type === 'overlay_B') {
      return "Set a goal interaction activated"
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

      {/* Set a Goal Overlay - New */}
      {showSetGoalOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-md 
                          border border-emerald-400/20 rounded-3xl p-8 max-w-lg w-full mx-4 
                          transform transition-all duration-500 scale-100 animate-in">
            
            {/* Close button */}
            <button
              onClick={() => setShowSetGoalOverlay(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white 
                         transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 
                              bg-gradient-to-br from-emerald-400/20 to-teal-400/20 
                              rounded-full mb-4 backdrop-blur-sm border border-emerald-400/20">
                <Target className="w-8 h-8 text-emerald-300" />
              </div>
              
              <h2 className="text-3xl font-playfair font-semibold text-white mb-2">
                Set a Goal
              </h2>
              
              <p className="text-white/70 text-lg font-inter">
                Define your next milestone and take action
              </p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const goal = formData.get('goal') as string
              if (goal.trim()) {
                handleSetGoalSubmit(goal.trim())
                setShowSetGoalOverlay(false)
              }
            }} className="space-y-6">
              <div className="relative">
                <textarea
                  name="goal"
                  placeholder="What goal would you like to set?"
                  className="w-full h-32 px-4 py-3 bg-white/10 backdrop-blur-sm 
                             border border-emerald-400/20 rounded-xl text-white placeholder-white/50
                             focus:outline-none focus:ring-2 focus:ring-emerald-400/50 
                             focus:border-emerald-400/50 transition-all duration-300
                             resize-none font-inter"
                  maxLength={300}
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetGoalOverlay(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 
                             text-white rounded-xl transition-all duration-300
                             border border-white/20 hover:border-white/30
                             font-inter font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500/80 to-teal-500/80
                             hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl 
                             transition-all duration-300 font-inter font-medium
                             flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Set Goal
                </button>
              </div>
            </form>

            {/* Decorative elements */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400/30 rounded-full blur-sm"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-teal-400/30 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 -right-4 w-2 h-2 bg-emerald-300/20 rounded-full blur-sm"></div>
          </div>
        </div>
      )}

      {/* Event History Panel */}
      {events.length > 0 && (
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
              )}
            </div>

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