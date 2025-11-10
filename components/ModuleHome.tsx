
import React from 'react';
import { Sparkles, Network, BookOpen, PenTool, ArrowRight } from 'lucide-react';
import { ModuleType, Language } from '../types';

interface ModuleHomeProps {
  onNavigate: (module: ModuleType) => void;
  lang: Language;
}

const ModuleHome: React.FC<ModuleHomeProps> = ({ onNavigate, lang }) => {
  const t = {
    en: {
      title: "Research with Clarity",
      subtitle: "An intelligent research assistant designed for social scientists. From vague ideas to polished manuscripts, we support your entire academic journey.",
      features: [
        { id: ModuleType.INSPIRATION, icon: Sparkles, title: "Inspiration Generator", desc: "Turn abstract interests into concrete research proposals with variables and hypotheses." },
        { id: ModuleType.FRAMEWORK, icon: Network, title: "Framework Analyzer", desc: "Instantly extract the theoretical and methodological skeleton from any academic paper." },
        { id: ModuleType.LIT_REVIEW, icon: BookOpen, title: "Literature Review", desc: "Auto-synthesize key themes from real academic sources and identify research gaps." },
        { id: ModuleType.WRITING, icon: PenTool, title: "Writing Assistant", desc: "Polish your academic tone and format references strictly to APA standards." },
      ],
      start: "Get Started"
    },
    zh: {
      title: "让研究更高效，让思路更清晰",
      subtitle: "一站式学术助手，从模糊的灵感到完美的文稿，为您的研究提供全流程智能支持。",
      features: [
        { id: ModuleType.INSPIRATION, icon: Sparkles, title: "灵感生成器", desc: "将抽象的研究兴趣转化为包含变量和假设的具体研究方案。" },
        { id: ModuleType.FRAMEWORK, icon: Network, title: "框架分析器", desc: "一键提取学术论文的理论视角与方法论骨架。" },
        { id: ModuleType.LIT_REVIEW, icon: BookOpen, title: "文献综述", desc: "自动综合真实文献的核心观点，并识别研究空白。" },
        { id: ModuleType.WRITING, icon: PenTool, title: "写作辅助", desc: "润色学术表达，并严格按照APA标准格式化参考文献。" },
      ],
      start: "开始使用"
    }
  };

  const content = t[lang];

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-16 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
          {content.title}
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onNavigate(feature.id)}
            className="flex flex-col text-left bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 hover:bg-stone-50 transition-all group"
          >
            <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
              <feature.icon className="w-6 h-6 text-stone-600 group-hover:text-teal-600" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-stone-900 mb-2 group-hover:text-teal-700">
              {feature.title}
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              {feature.desc}
            </p>
            <div className="mt-4 flex items-center text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {content.start} <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleHome;
