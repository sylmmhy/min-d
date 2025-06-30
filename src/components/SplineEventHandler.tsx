import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Compass, Target, Heart } from 'lucide-react'
import { LifeGoalsModal } from './LifeGoalsModal'
import { WelcomePanel } from './WelcomePanel'

interface SplineEvent {
  type: string
  payload: {
    number?: number
    action?: string
    buttonId?: string
    apiEndpoint?: string
    modalType?: string
    uiAction?: string
    message?: string
    source?: string
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
  const [showModal, setShowModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<SplineEvent | null>(null)
  const [showLifeGoalsModal, setShowLifeGoalsModal] = useState(false)
  const [showWelcomePanel, setShowWelcomePanel] = useState(false)

  useEffect(() => {
    console.log('🚀 初始化 Spline 事件处理器...')

    // Subscribe to Spline events via Supabase Realtime
    const channel = supabase.channel('spline-events')
    
    channel
      .on('broadcast', { event: 'spline_interaction' }, (payload) => {
        const event = payload.payload as SplineEvent
        
        console.log('=== 前端收到 SPLINE 事件 ===')
        console.log('完整事件:', JSON.stringify(event, null, 2))
        
        setCurrentEvent(event)
        
        // 先关闭所有模态框，避免冲突
        setShowLifeGoalsModal(false)
        setShowWelcomePanel(false)
        
        // 简化且明确的决策逻辑
        const apiEndpoint = event.payload.apiEndpoint
        const source = event.payload.source
        const modalType = event.payload.modalType
        const uiAction = event.payload.uiAction
        
        let shouldShowWelcome = false
        let shouldShowGoals = false
        
        // 优先级1: 基于 API 端点和来源的精确匹配
        if (apiEndpoint === 'welcome-webhook' || source === 'welcome-webhook') {
          shouldShowWelcome = true
        } else if (apiEndpoint === 'goals-webhook' || source === 'goals-webhook') {
          shouldShowGoals = true
        }
        // 优先级2: 基于 Modal 类型
        else if (modalType === 'welcome') {
          shouldShowWelcome = true
        } else if (modalType === 'goals') {
          shouldShowGoals = true
        }
        // 优先级3: 基于 UI 动作
        else if (uiAction === 'show_welcome') {
          shouldShowWelcome = true
        } else if (uiAction === 'show_goals') {
          shouldShowGoals = true
        }
        // 优先级4: 基于事件类型
        else if (event.type === 'spline_welcome_trigger') {
          shouldShowWelcome = true
        } else if (event.type === 'spline_goals_trigger') {
          shouldShowGoals = true
        }
        // 默认回退
        else {
          shouldShowGoals = true
        }
        
        // 执行决策 - 使用延迟确保状态更新
        setTimeout(() => {
          if (shouldShowWelcome) {
            setShowWelcomePanel(true)
            setShowLifeGoalsModal(false)
          } else if (shouldShowGoals) {
            setShowLifeGoalsModal(true)
            setShowWelcomePanel(false)
          }
        }, 100)
        
        // Call the callback if provided
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
    // Here you could save to Supabase database if needed
  }

  const getEventIcon = (event: SplineEvent) => {
    const { apiEndpoint, modalType, uiAction, source } = event.payload
    
    if (apiEndpoint === 'welcome-webhook' || source === 'welcome-webhook' || 
        modalType === 'welcome' || uiAction === 'show_welcome') {
      return <Compass className="w-6 h-6 text-blue-400" />
    }
    if (apiEndpoint === 'goals-webhook' || source === 'goals-webhook' || 
        modalType === 'goals' || uiAction === 'show_goals') {
      return <Target className="w-6 h-6 text-purple-400" />
    }
    return <Sparkles className="w-6 h-6 text-white" />
  }

  const getEventTitle = (event: SplineEvent) => {
    const { apiEndpoint, modalType, uiAction, source, message } = event.payload
    
    if (apiEndpoint === 'welcome-webhook' || source === 'welcome-webhook' || 
        modalType === 'welcome' || uiAction === 'show_welcome') {
      return "欢迎启航!"
    }
    if (apiEndpoint === 'goals-webhook' || source === 'goals-webhook' || 
        modalType === 'goals' || uiAction === 'show_goals') {
      return "人生目标!"
    }
    if (message) return message
    return "Spline 交互"
  }

  const getEventDescription = (event: SplineEvent) => {
    const parts = []
    if (event.payload.apiEndpoint) parts.push(`端点: ${event.payload.apiEndpoint}`)
    if (event.payload.source) parts.push(`来源: ${event.payload.source}`)
    if (event.payload.modalType) parts.push(`模态: ${event.payload.modalType}`)
    if (event.payload.uiAction) parts.push(`动作: ${event.payload.uiAction}`)
    
    return parts.length > 0 ? parts.join(' • ') : '交互元素已激活'
  }

  return (
    <>
      {/* 人生目标模态框 */}
      <LifeGoalsModal
        isOpen={showLifeGoalsModal}
        onClose={() => setShowLifeGoalsModal(false)}
        onSubmit={handleLifeGoalSubmit}
      />

      {/* 欢迎面板 - 左侧固定位置 */}
      <WelcomePanel
        isVisible={showWelcomePanel}
        onClose={() => setShowWelcomePanel(false)}
      />

      {/* 事件详情模态框 */}
      {showModal && currentEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 
                          max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-white">
                {getEventIcon(currentEvent)}
                <h2 className="text-xl font-semibold">{getEventTitle(currentEvent)}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-white/80">
              <p className="text-lg">{getEventDescription(currentEvent)}</p>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-white">事件详情:</h3>
                <div className="space-y-1 text-sm">
                  <div>来源: {currentEvent.source}</div>
                  <div>类型: {currentEvent.type}</div>
                  <div>时间: {new Date(currentEvent.timestamp).toLocaleString()}</div>
                </div>
              </div>

              {Object.keys(currentEvent.payload).length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-white">载荷数据:</h3>
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
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}