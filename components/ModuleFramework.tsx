
import React, { useState } from 'react';
import { Network, Loader2, Eraser, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { analyzeFramework } from '../services/geminiService';
import MarkdownView from './MarkdownView';
import { LoadingState, Language } from '../types';

interface Props {
  lang: Language;
}

const ModuleFramework: React.FC<Props> = ({ lang }) => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    en: {
      sourceTitle: "Source",
      modeText: "Paste Text",
      modeFile: "Upload PDF",
      clear: "Clear",
      placeholder: "Paste the abstract or introduction of a paper here...",
      dropzone: "Click to upload or drag PDF here (Max 4MB)",
      selected: "File selected:",
      btn: "Extract Framework",
      outputTitle: "Structured Analysis",
      empty: "Analysis results will appear here",
      loading: "Deconstructing logic...",
      error: "Analysis failed.",
      fileUnreadable: "Unable to recognize file content, please paste text."
    },
    zh: {
      sourceTitle: "来源",
      modeText: "粘贴文本",
      modeFile: "上传 PDF",
      clear: "清空",
      placeholder: "请在此粘贴论文的摘要或引言部分...",
      dropzone: "点击上传或拖拽 PDF 文件到此处 (最大 4MB)",
      selected: "已选文件：",
      btn: "提取框架",
      outputTitle: "结构化分析",
      empty: "分析结果将显示在这里",
      loading: "正在拆解逻辑...",
      error: "分析失败。",
      fileUnreadable: "无法识别文件内容，请粘贴文本"
    }
  };

  const text = t[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) {
        setErrorMsg(lang === 'zh' ? '文件过大 (超过 4MB)' : 'File too large (Max 4MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'file' && !selectedFile) return;

    setStatus('loading');
    setErrorMsg('');
    setResult('');
    try {
      const responseText = await analyzeFramework(inputText, selectedFile, lang);
      
      if (responseText.includes("ERROR_FILE_UNREADABLE")) {
        setStatus('error');
        setErrorMsg(text.fileUnreadable);
      } else {
        setResult(responseText);
        setStatus('success');
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message || text.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        
        {/* Input Section */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-2 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
             <div className="flex bg-stone-200/50 rounded-lg p-1">
                <button 
                  onClick={() => { setMode('text'); setSelectedFile(null); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'text' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                   {text.modeText}
                </button>
                <button 
                  onClick={() => { setMode('file'); setInputText(''); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'file' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                   {text.modeFile}
                </button>
             </div>
             <button 
                onClick={() => { setInputText(''); setSelectedFile(null); setErrorMsg(''); }}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-teal-600 transition-colors mr-2"
             >
                <Eraser className="w-3 h-3" />
                {text.clear}
             </button>
          </div>

          <div className="flex-1 flex flex-col relative">
            {mode === 'text' ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={text.placeholder}
                className="flex-1 w-full p-6 resize-none outline-none text-stone-700 leading-relaxed bg-white text-sm"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                 <label className="flex flex-col items-center justify-center w-full h-full border-2 border-stone-200 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-400">
                        <Upload className="w-10 h-10 mb-3 text-stone-300" />
                        <p className="mb-2 text-sm font-medium">{text.dropzone}</p>
                    </div>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                 </label>
                 {selectedFile && (
                    <div className="mt-4 flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-lg text-sm w-full animate-in fade-in slide-in-from-bottom-2">
                       <FileCheck className="w-4 h-4" />
                       <span className="truncate font-medium">{selectedFile.name}</span>
                    </div>
                 )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-100 bg-white">
             <button
                onClick={handleAnalyze}
                disabled={status === 'loading' || (mode === 'text' && !inputText) || (mode === 'file' && !selectedFile)}
                className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition font-medium flex justify-center items-center gap-2 shadow-sm"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Network className="w-4 h-4" /> {text.btn}</>}
              </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden relative">
           <div className="p-4 border-b border-stone-100 bg-stone-50">
             <span className="font-semibold text-stone-700 text-sm">{text.outputTitle}</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-white">
             {status === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-stone-300">
                   <Network className="w-12 h-12 mb-3 opacity-30" />
                   <p className="text-sm">{text.empty}</p>
                </div>
             )}
             {status === 'loading' && (
                <div className="h-full flex flex-col items-center justify-center text-teal-600">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <p className="text-sm font-medium">{text.loading}</p>
                </div>
             )}
             {status === 'success' && (
               <div className="animate-in fade-in zoom-in-95 duration-300">
                  <MarkdownView content={result} />
               </div>
             )}
             {status === 'error' && (
               <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
                  <AlertCircle className="w-8 h-8 opacity-50" />
                  <p className="text-sm text-center px-6">{errorMsg}</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModuleFramework;
