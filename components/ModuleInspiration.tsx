
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { generateInspiration } from '../services/geminiService';
import MarkdownView from './MarkdownView';
import { LoadingState, Language } from '../types';

interface Props {
  lang: Language;
}

type Methodology = 'quantitative' | 'qualitative' | 'theoretical' | '';

const ModuleInspiration: React.FC<Props> = ({ lang }) => {
  const [topic, setTopic] = useState('');
  const [methodology, setMethodology] = useState<Methodology>('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<LoadingState>('idle');

  const t = {
    en: {
      title: "Topic Inspiration",
      desc: "Enter a vague research direction or keyword. We'll draft a structured proposal for you.",
      methodLabel: "Select Research Methodology (Required)",
      methods: {
        quant: { label: "Quantitative", desc: "Variables, Hypotheses, Statistics" },
        qual: { label: "Qualitative", desc: "Interviews, Processes, Meanings" },
        theo: { label: "Theoretical", desc: "Concepts, Logic, Propositions" }
      },
      placeholder: "e.g., Remote work impact on employee well-being...",
      btn: "Generate Proposal",
      error: "Something went wrong. Please check your API key."
    },
    zh: {
      title: "研究灵感生成",
      desc: "输入模糊的研究方向或关键词，我们将为您草拟一份结构化的研究方案。",
      methodLabel: "选择研究范式（必选）",
      methods: {
        quant: { label: "实证定量", desc: "变量、假设、统计验证" },
        qual: { label: "实证定性", desc: "访谈、过程、意义建构" },
        theo: { label: "纯理论研究", desc: "概念、逻辑、命题推导" }
      },
      placeholder: "例如：远程办公对员工幸福感的影响...",
      btn: "生成研究方案",
      error: "出错了，请检查您的 API Key。"
    }
  };

  const text = t[lang];

  const handleGenerate = async () => {
    if (!topic.trim() || !methodology) return;
    setStatus('loading');
    try {
      const responseText = await generateInspiration(topic, methodology, lang);
      setResult(responseText);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        <div className="flex items-start space-x-5">
          <div className="p-3 bg-stone-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-stone-600" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">{text.title}</h2>
              <p className="text-stone-500 mt-1">
                {text.desc}
              </p>
            </div>
            
            {/* Methodology Selector */}
            <div className="space-y-3">
               <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{text.methodLabel}</span>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setMethodology('quantitative')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${methodology === 'quantitative' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-teal-200 hover:bg-white'}`}
                  >
                     <BarChart3 className={`w-6 h-6 mb-2 ${methodology === 'quantitative' ? 'text-teal-600' : 'text-stone-400'}`} />
                     <span className="font-semibold text-sm">{text.methods.quant.label}</span>
                     <span className="text-[10px] opacity-70 mt-1">{text.methods.quant.desc}</span>
                  </button>

                  <button 
                    onClick={() => setMethodology('qualitative')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${methodology === 'qualitative' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-teal-200 hover:bg-white'}`}
                  >
                     <FileText className={`w-6 h-6 mb-2 ${methodology === 'qualitative' ? 'text-teal-600' : 'text-stone-400'}`} />
                     <span className="font-semibold text-sm">{text.methods.qual.label}</span>
                     <span className="text-[10px] opacity-70 mt-1">{text.methods.qual.desc}</span>
                  </button>

                  <button 
                    onClick={() => setMethodology('theoretical')}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${methodology === 'theoretical' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-teal-200 hover:bg-white'}`}
                  >
                     <Lightbulb className={`w-6 h-6 mb-2 ${methodology === 'theoretical' ? 'text-teal-600' : 'text-stone-400'}`} />
                     <span className="font-semibold text-sm">{text.methods.theo.label}</span>
                     <span className="text-[10px] opacity-70 mt-1">{text.methods.theo.desc}</span>
                  </button>
               </div>
            </div>

            {/* Topic Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={text.placeholder}
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-stone-800"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={status === 'loading' || !topic || !methodology}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition font-medium shadow-sm min-w-[140px] justify-center"
              >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : text.btn}
                {!status.startsWith('load') && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {status === 'success' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <MarkdownView content={result} />
        </div>
      )}

      {status === 'error' && (
         <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-100">
            {text.error}
         </div>
      )}
    </div>
  );
};

export default ModuleInspiration;
