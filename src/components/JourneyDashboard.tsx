import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowLeft, Mountain, Compass, Target, BookOpen, Lightbulb } from 'lucide-react';
import { designSystem } from '../styles/designSystem';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  icon: React.ReactNode;
  content: {
    title: string;
    description: string;
    imageUrl: string;
  };
}

interface JourneyDashboardProps {
  isVisible: boolean;
  onBack: () => void;
  userGoal?: string;
}

export const JourneyDashboard: React.FC<JourneyDashboardProps> = ({
  isVisible,
  onBack,
  userGoal = "写个人陈述"
}) => {
  const [selectedTodo, setSelectedTodo] = useState<string>('write-ps');

  const todoItems: TodoItem[] = [
    {
      id: 'write-ps',
      title: 'Write PS',
      completed: false,
      icon: <BookOpen className="w-5 h-5" />,
      content: {
        title: 'Write PS - 论文大陆：',
        description: '由于要申请学校，所以需要写个人陈述。这个个人陈述，你的要求是什么？',
        imageUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    },
    {
      id: 'design-ui',
      title: 'Design UI',
      completed: false,
      icon: <Lightbulb className="w-5 h-5" />,
      content: {
        title: 'Design UI - 创意设计：',
        description: '设计用户界面需要考虑用户体验、视觉美感和功能性。让我们一起探索现代设计的原则和最佳实践。',
        imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    },
    {
      id: 'plan-journey',
      title: 'Plan Journey',
      completed: true,
      icon: <Compass className="w-5 h-5" />,
      content: {
        title: 'Plan Journey - 规划路径：',
        description: '每个伟大的旅程都始于一个清晰的计划。让我们制定一个实现你目标的详细路线图。',
        imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    },
    {
      id: 'set-goals',
      title: 'Set Goals',
      completed: true,
      icon: <Target className="w-5 h-5" />,
      content: {
        title: 'Set Goals - 目标设定：',
        description: '明确的目标是成功的基石。让我们一起设定可实现、可衡量的目标，为你的未来铺路。',
        imageUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    }
  ];

  const selectedItem = todoItems.find(item => item.id === selectedTodo);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
      
      {/* Main container */}
      <div className="flex h-full">
        {/* Left Sidebar - Todo List */}
        <div className="w-80 bg-gradient-to-br from-white/10 via-white/5 to-white/8 backdrop-blur-xl border-r border-white/20 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/15">
            <button
              onClick={onBack}
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-inter text-sm">Back to Voice Input</span>
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Mountain className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-playfair font-semibold text-white">Journey Map</h2>
            </div>
            <p className="text-white/70 text-sm font-inter">Your path to: {userGoal}</p>
          </div>

          {/* Todo List */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {todoItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTodo(item.id)}
                className={`w-full p-4 rounded-xl transition-all duration-300 text-left group ${
                  selectedTodo === item.id
                    ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 border border-white/30 shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-200 ${
                    item.completed ? 'text-green-400' : 'text-white/60'
                  }`}>
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`transition-colors duration-200 ${
                      selectedTodo === item.id ? 'text-blue-300' : 'text-white/70'
                    }`}>
                      {item.icon}
                    </div>
                    <span className={`font-inter font-medium transition-colors duration-200 ${
                      selectedTodo === item.id ? 'text-white' : 'text-white/80'
                    } ${item.completed ? 'line-through text-white/60' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="p-6 border-t border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-inter">Progress</span>
              <span className="text-white text-sm font-inter font-medium">
                {todoItems.filter(item => item.completed).length}/{todoItems.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(todoItems.filter(item => item.completed).length / todoItems.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {selectedItem && (
            <>
              {/* Content Header */}
              <div className="p-8 border-b border-white/15">
                <div className="max-w-4xl">
                  <h1 className="text-3xl font-playfair font-bold text-white mb-4 leading-tight">
                    {selectedItem.content.title}
                  </h1>
                  <p className="text-lg text-white/90 font-inter leading-relaxed">
                    {selectedItem.content.description}
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl">
                  {/* Image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
                    <img
                      src={selectedItem.content.imageUrl}
                      alt={selectedItem.content.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>

                  {/* Additional content area */}
                  <div className="bg-gradient-to-br from-white/8 via-white/5 to-white/3 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <h3 className="text-xl font-playfair font-semibold text-white mb-4">
                      Next Steps
                    </h3>
                    <div className="space-y-4 text-white/80 font-inter leading-relaxed">
                      <p>
                        Based on your goal to "{userGoal}", here are some actionable steps you can take:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Break down your main objective into smaller, manageable tasks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Set specific deadlines for each milestone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Identify resources and tools you'll need</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Create a daily routine that supports your goal</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating action button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
        <Compass className="w-6 h-6" />
      </button>
    </div>
  );
};