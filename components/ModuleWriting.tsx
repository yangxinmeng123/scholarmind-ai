import React, { useState } from 'react';
import { PenTool, Quote, Loader2, Copy } from 'lucide-react';
import { polishWriting } from '../services/geminiService';
import MarkdownView from './MarkdownView';
import { LoadingState, Language } from '../types';

interface Props {
  lang: Language;
}

const ModuleWriting: React.FC<Props> = ({ lang }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'polish' | 'citation'>('polish');
  const [status, setStatus] = useState<LoadingState>('idle');

  const t = {
    en: {
      polishBtn: "Text Polishing",
      citeBtn: "APA Formatting",
      original: "Original Text",
      placeholderPolish: "Paste a rough paragraph here to improve its academic tone...",
      placeholderCite: "Paste a list of messy references here...",
      actionBtn: "Improve Text",
      suggestion: "AI Suggestion",
      empty: "Processed text will appear here.",
      processing: "Polishing...",
      error: "Error processing text."
    },
    zh: {
      polishBtn: "文本润色",
      citeBtn: "APA 格式化",
      original: "原文",
      placeholderPolish: "在此粘贴一段粗糙的文本以提升其学术语调...",
      placeholderCite: "在此粘贴格式混乱的参考文献列表...",
      actionBtn: "优化文本",
      suggestion: "AI 建议",
      empty: "处理后的文本将显示在这里。",
      processing: "润色中...",
      error: "处理文本时出错。"
    }
  };

  const text = t[lang];

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setStatus('loading');
    try {
      const responseText = await polishWriting(inputText, mode, lang);
      setResult(responseText);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Toolbar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-200 flex justify-center w-fit mx-auto">
         <div className="flex bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setMode('polish')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'polish' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <PenTool className="w-4 h-4" /> {text.polishBtn}
            </button>
            <button 
              onClick={() => setMode('citation')}
               className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'citation' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <Quote className="w-4 h-4" /> {text.citeBtn}
            </button>
         </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* Input */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-stone-200">
           <div className="p-4 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider">
              {text.original}
           </div>
           <textarea
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder={mode === 'polish' ? text.placeholderPolish : text.placeholderCite}
             className="flex-1 w-full p-6 resize-none outline-none text-stone-700 leading-relaxed bg-transparent text-sm"
           />
           <div className="p-4 border-t border-stone-100 flex justify-end bg-stone-50 rounded-b-xl">
              <button
                onClick={handleProcess}
                disabled={status === 'loading' || !inputText}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium flex items-center gap-2 transition shadow-sm"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : text.actionBtn}
              </button>
           </div>
        </div>

        {/* Output */}
        <div className="flex flex-col bg-teal-50/30 rounded-xl shadow-sm border border-teal-100/50">
           <div className="p-4 border-b border-teal-100/50 flex justify-between items-center">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{text.suggestion}</span>
              {status === 'success' && (
                <button onClick={copyToClipboard} className="text-teal-600 hover:text-teal-800 p-1.5 rounded-md hover:bg-teal-100 transition" title="Copy">
                   <Copy className="w-4 h-4" />
                </button>
              )}
           </div>
           <div className="flex-1 p-6 overflow-y-auto">
              {status === 'idle' && (
                 <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">
                    {text.empty}
                 </div>
              )}
              {status === 'loading' && (
                 <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-teal-600">
                       <Loader2 className="w-8 h-8 animate-spin" />
                       <span className="text-sm font-medium">{text.processing}</span>
                    </div>
                 </div>
              )}
              {status === 'success' && (
                  <div className="prose prose-stone max-w-none text-sm">
                      <MarkdownView content={result} />
                  </div>
              )}
               {status === 'error' && (
                 <div className="h-full flex items-center justify-center text-red-400 text-sm">
                    {text.error}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ModuleWriting;