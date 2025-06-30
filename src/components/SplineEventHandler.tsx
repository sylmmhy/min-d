import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Sparkles, Play, Zap, Compass, AlertCircle, Target, Heart } from 'lucide-react'
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
  const [events, setEvents] = useState<SplineEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<SplineEvent | null>(null)
  const [showLifeGoalsModal, setShowLifeGoalsModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo(prev => [`[${timestamp}] ${info}`, ...prev.slice(0, 20)])
    console.log(`[DEBUG] ${info}`)
  }

  useEffect(() => {
    addDebugInfo('🚀 初始化 Spline 事件处理器...')
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('_test').select('*').limit(1)
        if (error && error.code !== 'PGRST116') {
          addDebugInfo(`❌ Supabase 错误: ${error.message}`)
        } else {
          addDebugInfo('✅ Supabase 连接成功')
        }
      } catch (err) {
        addDebugInfo(`❌ 连接测试失败: ${err}`)
      }
    }
    
    testConnection()

    // Subscribe to Spline events via Supabase Realtime
    const channel = supabase.channel('spline-events')
    
    channel
      .on('broadcast', { event: 'spline_interaction' }, (payload) => {
        const event = payload.payload as SplineEvent
        
        addDebugInfo('🎯 === 收到新的 SPLINE 事件 ===')
        addDebugInfo(`📊 事件类型: ${event.type}`)
        addDebugInfo(`🔢 Number: ${event.payload.number}`)
        addDebugInfo(`🎭 Modal 类型: ${event.payload.modalType}`)
        addDebugInfo(`⚡ UI 动作: ${event.payload.uiAction}`)
        addDebugInfo(`🌐 API 端点: ${event.payload.apiEndpoint}`)
        addDebugInfo(`📍 来源: ${event.payload.source}`)
        
        console.log('=== 前端收到 SPLINE 事件 ===')
        console.log('完整事件:', JSON.stringify(event, null, 2))
        
        // Update events list
        setEvents(prev => [event, ...prev.slice(0, 9)])
        setCurrentEvent(event)
        
        // 🔥 CRITICAL: 先关闭所有模态框，避免冲突
        setShowLifeGoalsModal(false)
        setShowWelcomeModal(false)
        
        // 🎯 简化且明确的决策逻辑
        const apiEndpoint = event.payload.apiEndpoint
        const source = event.payload.source
        const modalType = event.payload.modalType
        const uiAction = event.payload.uiAction
        
        addDebugInfo(`🔍 决策分析开始...`)
        addDebugInfo(`   - API端点: ${apiEndpoint}`)
        addDebugInfo(`   - 来源: ${source}`)
        addDebugInfo(`   - Modal类型: ${modalType}`)
        addDebugInfo(`   - UI动作: ${uiAction}`)
        
        let finalDecision = ''
        let shouldShowWelcome = false
        let shouldShowGoals = false
        
        // 🎯 优先级1: 基于 API 端点和来源的精确匹配
        if (apiEndpoint === 'welcome-webhook' || source === 'welcome-webhook') {
          shouldShowWelcome = true
          finalDecision = '✅ 欢迎模态 (API端点匹配)'
        } else if (apiEndpoint === 'goals-webhook' || source === 'goals-webhook') {
          shouldShowGoals = true
          finalDecision = '✅ 目标模态 (API端点匹配)'
        }
        // 🎯 优先级2: 基于 Modal 类型
        else if (modalType === 'welcome') {
          shouldShowWelcome = true
          finalDecision = '✅ 欢迎模态 (Modal类型匹配)'
        } else if (modalType === 'goals') {
          shouldShowGoals = true
          finalDecision = '✅ 目标模态 (Modal类型匹配)'
        }
        // 🎯 优先级3: 基于 UI 动作
        else if (uiAction === 'show_welcome') {
          shouldShowWelcome = true
          finalDecision = '✅ 欢迎模态 (UI动作匹配)'
        } else if (uiAction === 'show_goals') {
          shouldShowGoals = true
          finalDecision = '✅ 目标模态 (UI动作匹配)'
        }
        // 🎯 优先级4: 基于事件类型
        else if (event.type === 'spline_welcome_trigger') {
          shouldShowWelcome = true
          finalDecision = '✅ 欢迎模态 (事件类型匹配)'
        } else if (event.type === 'spline_goals_trigger') {
          shouldShowGoals = true
          finalDecision = '✅ 目标模态 (事件类型匹配)'
        }
        // 🎯 默认回退
        else {
          shouldShowGoals = true
          finalDecision = '⚠️ 目标模态 (默认回退)'
        }
        
        addDebugInfo(`🎯 最终决策: ${finalDecision}`)
        
        // 🚀 执行决策 - 使用延迟确保状态更新
        setTimeout(() => {
          if (shouldShowWelcome) {
            addDebugInfo('🚢 正在显示欢迎模态...')
            setShowWelcomeModal(true)
            setShowLifeGoalsModal(false) // 确保另一个关闭
            addDebugInfo('✅ 欢迎模态已打开')
          } else if (shouldShowGoals) {
            addDebugInfo('🎯 正在显示目标模态...')
            setShowLifeGoalsModal(true)
            setShowWelcomeModal(false) // 确保另一个关闭
            addDebugInfo('✅ 目标模态已打开')
          }
        }, 100) // 短暂延迟确保状态清理完成
        
        // Call the callback if provided
        onEventReceived?.(event)
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        setConnectionStatus(status)
        addDebugInfo(`📡 实时状态: ${status}`)
        
        if (status === 'SUBSCRIBED') {
          addDebugInfo('🎉 成功订阅 spline-events 频道')
        }
      })

    return () => {
      supabase.removeChannel(channel)
      addDebugInfo('🔌 已断开 Supabase 连接')
    }
  }, [onEventReceived])

  const closeModal = () => {
    setShowModal(false)
    setCurrentEvent(null)
    addDebugInfo('❌ 事件模态已关闭')
  }

  const handleLifeGoalSubmit = (goal: string) => {
    console.log('Life goal submitted:', goal)
    addDebugInfo(`💝 人生目标已提交: "${goal.substring(0, 30)}${goal.length > 30 ? '...' : ''}"`)
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
      {/* 🎯 人生目标模态框 */}
      <LifeGoalsModal
        isOpen={showLifeGoalsModal}
        onClose={() => {
          addDebugInfo('🎯 用户关闭人生目标模态')
          setShowLifeGoalsModal(false)
        }}
        onSubmit={handleLifeGoalSubmit}
      />

      {/* 🚢 欢迎启航模态框 */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          addDebugInfo('🚢 用户关闭欢迎模态')
          setShowWelcomeModal(false)
        }}
      />

      {/* 🔧 增强调试面板 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black/95 text-white p-4 rounded-xl text-xs font-mono max-w-md border border-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-blue-400">Spline 调试面板</span>
        </div>
        
        <div className="space-y-1 mb-3 text-xs">
          <div className="flex justify-between">
            <span>连接状态:</span>
            <span className={connectionStatus === 'SUBSCRIBED' ? 'text-green-400' : 'text-yellow-400'}>
              {connectionStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span>🎯 目标模态:</span>
            <span className={showLifeGoalsModal ? 'text-green-400 font-bold' : 'text-gray-400'}>
              {showLifeGoalsModal ? '✅ 打开' : '❌ 关闭'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>🚢 欢迎模态:</span>
            <span className={showWelcomeModal ? 'text-green-400 font-bold' : 'text-gray-400'}>
              {showWelcomeModal ? '✅ 打开' : '❌ 关闭'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>最后端点:</span>
            <span className="text-blue-300">
              {currentEvent?.payload?.apiEndpoint || 'none'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>事件来源:</span>
            <span className="text-purple-300">
              {currentEvent?.payload?.source || 'none'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>事件总数:</span>
            <span className="text-yellow-300">
              {events.length}
            </span>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-2">
          <div className="font-bold mb-2 text-green-400">调试日志:</div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {debugInfo.slice(0, 15).map((info, index) => (
              <div key={index} className="text-xs text-white/80 break-words leading-tight">
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 事件历史面板 */}
      {events.length > 0 && (
        <div className="fixed top-4 left-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 
                        rounded-xl p-4 max-w-sm">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            最近事件 ({events.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.slice(0, 5).map((event, index) => (
              <div key={index} className="text-xs text-white/80 bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  {getEventIcon(event)}
                  <div className="font-medium text-white">{getEventTitle(event)}</div>
                </div>
                <div className="text-white/60 mb-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-white/50 text-xs">
                  {getEventDescription(event)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 事件详情模态框 */}
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