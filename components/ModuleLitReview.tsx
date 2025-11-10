
import React, { useState } from 'react';
import { BookOpen, Search, Globe, Loader2, ExternalLink, Upload, FileText, XCircle, AlertCircle } from 'lucide-react';
import { generateLitReview } from '../services/geminiService';
import MarkdownView from './MarkdownView';
import { LoadingState, Language } from '../types';

interface Props {
  lang: Language;
}

const ModuleLitReview: React.FC<Props> = ({ lang }) => {
  const [mode, setMode] = useState<'search' | 'upload'>('search');
  const [keywords, setKeywords] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{text: string, sources: any[]}>({ text: '', sources: [] });
  const [status, setStatus] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    en: {
      title: "Literature Review Assistant",
      desc: "Generate a comprehensive literature review draft. You can either search for web sources or upload specific PDFs to synthesize.",
      modeSearch: "Web Search",
      modeUpload: "Upload Papers",
      placeholder: "Enter research keywords (e.g., 'AI adoption in healthcare barriers')",
      btn: "Synthesize",
      subtitle: "Literature Synthesis",
      sources: "References",
      noLinks: "No direct web links.",
      dropzone: "Upload multiple PDFs here (Max 4MB each)",
      remove: "Remove",
      fileCount: "files selected",
      errorLarge: "One or more files exceed 4MB.",
      error: "Generation failed."
    },
    zh: {
      title: "文献综述助手",
      desc: "生成综合文献综述草稿。您可以基于网络搜索最新文献，也可以上传特定的PDF论文进行综合分析。",
      modeSearch: "网络检索",
      modeUpload: "上传论文",
      placeholder: "输入研究关键词（例如：'人工智能在医疗领域的应用障碍'）",
      btn: "生成综述",
      subtitle: "文献综合",
      sources: "参考来源",
      noLinks: "无直接网络链接",
      dropzone: "在此上传多篇PDF（最多5篇，每篇<4MB）",
      remove: "移除",
      fileCount: "个文件已选择",
      errorLarge: "有一个或多个文件超过 4MB。",
      error: "生成失败。"
    }
  };

  const text = t[lang];

  const handleSearch = async () => {
    if (mode === 'search' && !keywords.trim()) return;
    if (mode === 'upload' && files.length === 0) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      const data = await generateLitReview(keywords, files, lang);
      setResult(data);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message || text.error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check sizes
      const oversized = newFiles.some(f => f.size > 4 * 1024 * 1024);
      if (oversized) {
          setErrorMsg(text.errorLarge);
          return;
      }

      // Limit to 5 files for demo purposes to prevent payload issues
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="bg-white p-10 rounded-xl shadow-sm border border-stone-200 text-center">
         <div className="inline-flex p-4 bg-stone-100 rounded-full mb-6">
            <BookOpen className="w-8 h-8 text-stone-600" />
         </div>
         <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">{text.title}</h2>
         <p className="text-stone-500 mb-8 max-w-2xl mx-auto leading-relaxed">
           {text.desc}
         </p>
         
         {/* Mode Switcher */}
         <div className="flex justify-center mb-8">
            <div className="bg-stone-100 p-1 rounded-lg flex">
                <button
                  onClick={() => { setMode('search'); setFiles([]); setErrorMsg(''); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'search' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                   <Search className="w-4 h-4" /> {text.modeSearch}
                </button>
                <button
                  onClick={() => { setMode('upload'); setKeywords(''); setErrorMsg(''); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                   <Upload className="w-4 h-4" /> {text.modeUpload}
                </button>
            </div>
         </div>

         {/* Input Area */}
         <div className="max-w-2xl mx-auto relative">
            
            {mode === 'search' ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-stone-400" />
                </div>
                <input 
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={text.placeholder}
                  className="w-full pl-12 pr-32 py-4 bg-stone-50 border border-stone-200 rounded-full focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none shadow-sm transition-all text-lg text-stone-800"
                />
                 <button 
                  onClick={handleSearch}
                  disabled={status === 'loading' || !keywords.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 disabled:opacity-70 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : text.btn}
                </button>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                  <label className="block w-full border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:bg-stone-100 hover:border-teal-400 transition-all">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <span className="text-stone-500 font-medium">{text.dropzone}</span>
                      <input type="file" multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                  
                  {files.length > 0 && (
                    <div className="mt-4 text-left space-y-2">
                       <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{files.length} {text.fileCount}</div>
                       {files.map((file, idx) => (
                         <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                               <span className="truncate text-stone-700">{file.name}</span>
                            </div>
                            <button onClick={() => removeFile(idx)} className="text-stone-400 hover:text-red-500 ml-2">
                               <XCircle className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                       
                       <button 
                          onClick={handleSearch}
                          disabled={status === 'loading'}
                          className="w-full mt-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : text.btn}
                        </button>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm justify-center animate-in fade-in">
                       <AlertCircle className="w-4 h-4" />
                       <span>{errorMsg}</span>
                    </div>
                  )}
              </div>
            )}

         </div>
      </div>

      {/* Results Area */}
      {(status === 'success' || status === 'loading' || status === 'error') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Main Content */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 p-8 min-h-[400px]">
               {status === 'loading' ? (
                 <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                    <div className="h-4 bg-stone-100 rounded w-full"></div>
                    <div className="h-4 bg-stone-100 rounded w-5/6"></div>
                    <div className="h-32 bg-stone-50 rounded w-full mt-8"></div>
                 </div>
               ) : status === 'error' ? (
                 <div className="h-full flex items-center justify-center text-red-500 flex-col gap-2">
                     <AlertCircle className="w-10 h-10 opacity-50"/>
                     <p>{errorMsg || text.error}</p>
                 </div>
               ) : (
                 <div>
                    <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4">{text.subtitle}</h3>
                    <MarkdownView content={result.text} />
                 </div>
               )}
            </div>

            {/* Sidebar: Sources */}
            <div className="lg:col-span-1 space-y-4">
               <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 sticky top-8">
                  <div className="flex items-center gap-2 mb-5 text-stone-800 font-semibold pb-3 border-b border-stone-100">
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span>{text.sources}</span>
                  </div>
                  
                  {status === 'loading' ? (
                     <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-stone-50 rounded-lg animate-pulse"/>)}
                     </div>
                  ) : (
                    <ul className="space-y-3">
                      {result.sources.length > 0 ? (
                         result.sources.flatMap((chunk: any) => 
                            // Handle both web grounding chunks and mocked file sources
                            chunk.web?.uri ? [{ uri: chunk.web.uri, title: chunk.web.title }] : (chunk.web ? [chunk.web] : [])
                         ).map((source: any, idx: number) => (
                           <li key={idx} className="group">
                             <a 
                                href={source.uri !== '#' ? source.uri : undefined} 
                                target={source.uri !== '#' ? "_blank" : undefined} 
                                rel="noreferrer" 
                                className={`block p-3 rounded-lg border border-transparent transition-all ${source.uri !== '#' ? 'hover:bg-teal-50 hover:border-teal-100 cursor-pointer' : 'bg-stone-50 cursor-default'}`}
                             >
                               <p className="text-sm font-medium text-stone-700 group-hover:text-teal-800 line-clamp-2 mb-1">{source.title || 'Untitled Source'}</p>
                               {source.uri !== '#' && (
                                 <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-teal-600">
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate">{new URL(source.uri).hostname}</span>
                                 </div>
                               )}
                             </a>
                           </li>
                         ))
                      ) : (
                        <p className="text-sm text-stone-400 italic">{text.noLinks}</p>
                      )}
                    </ul>
                  )}
               </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default ModuleLitReview;
