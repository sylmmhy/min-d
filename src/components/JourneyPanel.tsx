import React, { useState } from 'react';
import { Compass, CheckCircle, Circle, Mail as Sail, Mountain, BookOpen, Palette } from 'lucide-react';
import { designSystem, getButtonStyle, getPanelStyle } from '../styles/designSystem';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'writing' | 'design' | 'learning' | 'personal';
  imageUrl: string;
  details: string;
}

interface JourneyPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'write PS',
    description: '论文大陆',
    completed: false,
    category: 'writing',
    imageUrl: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
    details: '由于要申请学校，所以需要写个人陈述这个个人陈述。你的要求是什么？'
  },
  {
    id: '2',
    title: 'Design UI',
    description: '界面设计',
    completed: false,
    category: 'design',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    details: '创建用户界面原型，包括交互设计和视觉层次结构。专注于用户体验和可用性。'
  },
  {
    id: '3',
    title: 'Learn React',
    description: '前端学习',
    completed: true,
    category: 'learning',
    imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    details: '深入学习React框架，掌握组件化开发和状态管理的核心概念。'
  },
  {
    id: '4',
    title: 'Morning Meditation',
    description: '冥想练习',
    completed: false,
    category: 'personal',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800',
    details: '每日晨间冥想练习，培养内心平静和专注力，为一天的工作做好准备。'
  }
];

const getCategoryIcon = (category: Task['category']) => {
  switch (category) {
    case 'writing':
      return <BookOpen className="w-4 h-4" />;
    case 'design':
      return <Palette className="w-4 h-4" />;
    case 'learning':
      return <Mountain className="w-4 h-4" />;
    case 'personal':
      return <Compass className="w-4 h-4" />;
    default:
      return <Circle className="w-4 h-4" />;
  }
};

export const JourneyPanel: React.FC<JourneyPanelProps> = ({
  isVisible,
  onClose
}) => {
  const [selectedTask, setSelectedTask] = useState<Task>(mockTasks[0]);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleStartJourney = () => {
    console.log('Starting journey with task:', selectedTask.title);
    // Here you could trigger navigation or other actions
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Left side - Ocean scene (transparent overlay to allow Spline to show through) */}
      <div className="flex-1 relative">
        {/* Very subtle overlay to create depth separation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none"></div>
      </div>

      {/* Right side - Task Panel */}
      <div className="w-[600px] p-8 flex items-center justify-center">
        <div className="relative w-full max-w-[520px] bg-gradient-to-br from-white/12 via-white/8 to-white/6 
                        backdrop-blur-2xl border border-white/25 rounded-3xl p-8
                        shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]
                        before:absolute before:inset-0 before:rounded-3xl 
                        before:bg-gradient-to-br before:from-white/8 before:via-transparent before:to-transparent 
                        before:pointer-events-none overflow-hidden">
          
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent 
                          rounded-3xl pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-md 
                              rounded-2xl flex items-center justify-center w-12 h-12
                              border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]
                              relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl"></div>
                <Sail className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-playfair font-normal text-white leading-tight">
                  Journey Dashboard
                </h2>
                <p className="text-white/70 text-sm font-inter">
                  Navigate your goals with intention
                </p>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex gap-6">
              {/* Left column - To Do List */}
              <div className="w-48 space-y-3">
                <h3 className="text-lg font-playfair font-medium text-white mb-4">
                  to do list
                </h3>
                
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 
                                  border backdrop-blur-md font-inter text-sm
                                  ${selectedTask.id === task.id 
                                    ? 'bg-white/15 border-white/30 text-white shadow-md' 
                                    : 'bg-white/8 border-white/20 text-white/80 hover:bg-white/12 hover:border-white/25'
                                  }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id);
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className={task.completed ? 'line-through opacity-60' : ''}>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-white/60 mt-1">{task.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right column - Task Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-playfair font-medium text-white mb-2">
                    {selectedTask.title} - {selectedTask.description}：
                  </h3>
                  <p className="text-white/80 font-inter text-sm leading-relaxed">
                    {selectedTask.details}
                  </p>
                </div>

                {/* Task illustration */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 
                                border border-white/20 shadow-lg">
                  <img
                    src={selectedTask.imageUrl}
                    alt={selectedTask.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Start Journey Button */}
                <div className="pt-4">
                  <button
                    onClick={handleStartJourney}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-400/30 to-purple-400/30
                               hover:from-blue-400/40 hover:to-purple-400/40 text-white rounded-xl 
                               transition-all duration-300 font-inter font-medium text-base
                               shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md
                               border border-white/25 hover:border-white/35
                               transform hover:scale-[1.02] active:scale-[0.98]
                               flex items-center justify-center gap-2"
                  >
                    <Sail className="w-5 h-5" />
                    开始航行
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/20 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white/15 rounded-full blur-sm animate-pulse" 
               style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/4 -right-2 w-2 h-2 bg-white/25 rounded-full blur-sm animate-pulse"
               style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 -left-2 w-3 h-3 bg-white/20 rounded-full blur-sm animate-pulse"
               style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </div>
  );
};