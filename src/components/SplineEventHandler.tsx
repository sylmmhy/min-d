import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Play, Zap } from 'lucide-react'
import { LifeGoalsModal } from './LifeGoalsModal'

interface SplineEvent {
  type: string
  payload: {
    number?: number
    action?: string
    buttonId?: string
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

  useEffect(() => {
    // Subscribe to Spline events via Supabase Realtime
    const channel = supabase.channel('spline-events')
    
    channel
      .on('broadcast', { event: 'spline_interaction' }, (payload) => {
        const event = payload.payload as SplineEvent
        console.log('Received Spline event:', event)
        
        setEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
        setCurrentEvent(event)
        
        // Show life goals modal when receiving Spline event
        setShowLifeGoalsModal(true)
        
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
    if (event.payload.number === 1) return <Play className="w-6 h-6" />
    if (event.payload.action) return <Zap className="w-6 h-6" />
    return <Sparkles className="w-6 h-6" />
  }

  const getEventTitle = (event: SplineEvent) => {
    if (event.payload.number === 1) return "Animation Triggered!"
    if (event.payload.action) return `Action: ${event.payload.action}`
    return "Spline Interaction"
  }

  const getEventDescription = (event: SplineEvent) => {
    const parts = []
    if (event.payload.number) parts.push(`Number: ${event.payload.number}`)
    if (event.payload.buttonId) parts.push(`Button: ${event.payload.buttonId}`)
    if (event.payload.action) parts.push(`Action: ${event.payload.action}`)
    
    return parts.length > 0 ? parts.join(' • ') : 'Interactive element activated'
  }

  return (
    <>
      {/* Life Goals Modal */}
      <LifeGoalsModal
        isOpen={showLifeGoalsModal}
        onClose={() => setShowLifeGoalsModal(false)}
        onSubmit={handleLifeGoalSubmit}
      />

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