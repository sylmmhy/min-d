import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Play, Zap, Compass } from 'lucide-react'
import { LifeGoalsModal } from './LifeGoalsModal'
import { WelcomeModal } from './WelcomeModal'

interface SplineEvent {
  type: string
  payload: {
    number?: number
    action?: string
    buttonId?: string
    apiEndpoint?: string
    modalType?: string
    timestamp?: string
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    // Subscribe to Spline events via Supabase Realtime
    const channel = supabase.channel('spline-events')
    
    channel
      .on('broadcast', { event: 'spline_interaction' }, (payload) => {
        const event = payload.payload as SplineEvent
        console.log('=== SPLINE EVENT RECEIVED ===')
        console.log('Full event:', JSON.stringify(event, null, 2))
        console.log('Event type:', event.type)
        console.log('Event payload:', JSON.stringify(event.payload, null, 2))
        
        setEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
        setCurrentEvent(event)
        
        // Close both modals first
        setShowLifeGoalsModal(false)
        setShowWelcomeModal(false)
        
        // Use explicit modalType if available, otherwise fall back to other checks
        const modalType = event.payload.modalType
        console.log('Modal type from payload:', modalType)
        
        if (modalType === 'welcome') {
          console.log('🚢 TRIGGERING WELCOME MODAL')
          setTimeout(() => setShowWelcomeModal(true), 100)
        } else if (modalType === 'goals') {
          console.log('🎯 TRIGGERING GOALS MODAL')
          setTimeout(() => setShowLifeGoalsModal(true), 100)
        } else {
          // Fallback logic
          console.log('Using fallback logic...')
          console.log('- number:', event.payload.number, typeof event.payload.number)
          console.log('- action:', event.payload.action)
          console.log('- event type:', event.type)
          
          if (event.payload.number === 2 || 
              event.type === 'spline_welcome_trigger' ||
              event.payload.action === 'second_api') {
            console.log('🚢 FALLBACK: TRIGGERING WELCOME MODAL')
            setTimeout(() => setShowWelcomeModal(true), 100)
          } else {
            console.log('🎯 FALLBACK: TRIGGERING GOALS MODAL')
            setTimeout(() => setShowLifeGoalsModal(true), 100)
          }
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
  }

  const getEventIcon = (event: SplineEvent) => {
    if (event.payload.number === 2 || event.payload.modalType === 'welcome') return <Compass className="w-6 h-6" />
    if (event.payload.number === 1 || event.payload.modalType === 'goals') return <Play className="w-6 h-6" />
    if (event.payload.action) return <Zap className="w-6 h-6" />
    return <Sparkles className="w-6 h-6" />
  }

  const getEventTitle = (event: SplineEvent) => {
    if (event.payload.number === 2 || event.payload.modalType === 'welcome') return "Welcome Journey!"
    if (event.payload.number === 1 || event.payload.modalType === 'goals') return "Life Goals!"
    if (event.payload.action === 'second_api') return "Welcome Message"
    if (event.payload.action === 'first_api') return "Life Goals Modal"
    if (event.payload.action) return `Action: ${event.payload.action}`
    return "Spline Interaction"
  }

  const getEventDescription = (event: SplineEvent) => {
    const parts = []
    if (event.payload.modalType) parts.push(`Modal: ${event.payload.modalType}`)
    if (event.payload.number) parts.push(`API: ${event.payload.number}`)
    if (event.payload.buttonId) parts.push(`Button: ${event.payload.buttonId}`)
    if (event.payload.action) parts.push(`Action: ${event.payload.action}`)
    if (event.payload.apiEndpoint) parts.push(`Endpoint: ${event.payload.apiEndpoint}`)
    
    return parts.length > 0 ? parts.join(' • ') : 'Interactive element activated'
  }

  return (
    <>
      {/* Life Goals Modal */}
      <LifeGoalsModal
        isOpen={showLifeGoalsModal}
        onClose={() => {
          console.log('Closing life goals modal')
          setShowLifeGoalsModal(false)
        }}
        onSubmit={handleLifeGoalSubmit}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          console.log('Closing welcome modal')
          setShowWelcomeModal(false)
        }}
      />

      {/* Debug Panel - shows current modal states */}
      <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
        <div>Goals Modal: {showLifeGoalsModal ? '✅' : '❌'}</div>
        <div>Welcome Modal: {showWelcomeModal ? '✅' : '❌'}</div>
        <div>Last Event: {currentEvent?.payload?.number || 'none'}</div>
        <div>Modal Type: {currentEvent?.payload?.modalType || 'none'}</div>
      </div>

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
                <div className="text-white/50 text-xs mt-1">
                  {getEventDescription(event)}
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