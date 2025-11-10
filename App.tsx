import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  PenTool, 
  Menu, 
  X,
  GraduationCap,
  Home,
  Languages
} from 'lucide-react';
import ModuleHome from './components/ModuleHome';
import ModuleInspiration from './components/ModuleInspiration';
import ModuleFramework from './components/ModuleFramework';
import ModuleLitReview from './components/ModuleLitReview';
import ModuleWriting from './components/ModuleWriting';
import { ModuleType, Language, NavItem } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.HOME);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');

  const navItems: NavItem[] = [
    { 
      id: ModuleType.HOME, 
      label: { en: 'Home', zh: '首页' }, 
      icon: <Home className="w-5 h-5" />,
      description: { en: 'Overview', zh: '概览' }
    },
    { 
      id: ModuleType.INSPIRATION, 
      label: { en: 'Inspiration Generator', zh: '灵感生成' }, 
      icon: <Sparkles className="w-5 h-5" />,
      description: { en: 'Draft proposals', zh: '起草方案' }
    },
    { 
      id: ModuleType.FRAMEWORK, 
      label: { en: 'Framework Analyzer', zh: '框架分析' }, 
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: { en: 'Extract logic', zh: '提取逻辑' }
    },
    { 
      id: ModuleType.LIT_REVIEW, 
      label: { en: 'Lit Review Assistant', zh: '文献综述' }, 
      icon: <BookOpen className="w-5 h-5" />,
      description: { en: 'Synthesize sources', zh: '综合文献' }
    },
    { 
      id: ModuleType.WRITING, 
      label: { en: 'Writing Polish', zh: '写作润色' }, 
      icon: <PenTool className="w-5 h-5" />,
      description: { en: 'Edit & Format', zh: '编辑与格式' }
    },
  ];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.HOME: return <ModuleHome onNavigate={setActiveModule} lang={language} />;
      case ModuleType.INSPIRATION: return <ModuleInspiration lang={language} />;
      case ModuleType.FRAMEWORK: return <ModuleFramework lang={language} />;
      case ModuleType.LIT_REVIEW: return <ModuleLitReview lang={language} />;
      case ModuleType.WRITING: return <ModuleWriting lang={language} />;
      default: return <ModuleHome onNavigate={setActiveModule} lang={language} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-stone-200 flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 flex items-center gap-3 border-b border-stone-100">
          <div className="bg-teal-700 p-2 rounded-lg shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-stone-900">ScholarMind</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 mb-2">
            {language === 'en' ? 'Menu' : '菜单'}
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                activeModule === item.id 
                  ? 'bg-stone-100 text-teal-800 font-medium' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <span className={`${activeModule === item.id ? 'text-teal-600' : 'text-stone-400 group-hover:text-stone-500'} transition-colors`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label[language]}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-100">
           <button 
             onClick={toggleLanguage}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium"
           >
             <Languages className="w-4 h-4" />
             {language === 'en' ? '中文 / English' : 'English / 中文'}
           </button>
           <div className="mt-4 text-center">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Powered by Gemini 2.5</p>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50 px-4 py-3 flex justify-between items-center">
         <div className="flex items-center gap-2" onClick={() => setActiveModule(ModuleType.HOME)}>
            <GraduationCap className="w-6 h-6 text-teal-700" />
            <span className="font-serif font-bold text-lg text-stone-900">ScholarMind</span>
         </div>
         <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="p-2 text-stone-500 hover:bg-stone-100 rounded-md">
               <Languages className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-md">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-stone-50 z-40 pt-20 px-4">
           <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left border ${
                  activeModule === item.id 
                  ? 'bg-white border-teal-200 text-teal-800 shadow-sm' 
                  : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label[language]}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:relative pt-16 md:pt-0">
        <header className="h-20 flex items-center justify-between px-8 flex-shrink-0 md:bg-stone-50/50 backdrop-blur-sm z-10">
            <div className="flex flex-col">
               <h1 className="text-2xl font-serif font-bold text-stone-900">
                 {navItems.find(i => i.id === activeModule)?.label[language]}
               </h1>
            </div>
            <div className="hidden md:flex items-center gap-4">
               <div className="h-9 w-9 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold">
                 SM
               </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 scroll-smooth">
          {renderModule()}
        </div>
      </main>

    </div>
  );
};

export default App;