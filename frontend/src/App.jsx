import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Initialize dark mode based on DRD default, but allow user toggle
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleReviewCode = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setResults(null);

    try {
      let sessionId = localStorage.getItem('codementor_session');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('codementor_session', sessionId);
      }

      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, sessionId })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setResults(data);

    } catch (error) {
      console.error("Error analyzing code:", error);
      alert("Failed to connect to the backend. Is the server running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyle = (severity) => {
    if (severity === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
    if (severity === 'medium') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
  };

  return (
    // The outermost div controls the theme context
    <div className={isDarkMode ? 'dark' : ''}>
      {/* The main wrapper applies the overarching background and text colors */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:p-8 font-sans transition-colors duration-300">
        <div className="max-w-6xl mx-auto">

          {/* Header Area with Flexbox to push the theme toggle to the right */}
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">
                CodeMentor AI
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wide">
                AI-Powered Code Review & Learning Assistant
              </p>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT PANEL */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/60 flex flex-col transition-colors duration-300">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="dart">Dart</option>
                </select>
              </div>

              <div className="flex-grow mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Code Snippet</label>
                {/* Professional Monaco Editor */}
                {/* <div className="w-full h-72 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-inner"> */}
                <div className="w-full h-96 xl:h-[400px] border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-inner">
                  <Editor
                    height="100%"
                    language={language}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false }, // Hides the mini-map to save space
                      fontSize: 14,
                      padding: { top: 16 },
                      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                    }}
                    loading={
                      <div className="flex justify-center items-center h-full text-slate-500">
                        Loading editor...
                      </div>
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleReviewCode}
                disabled={isAnalyzing || !code.trim()}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                {isAnalyzing ? 'Analyzing code...' : 'Review Code'}
              </button>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/60 overflow-y-auto max-h-[650px] transition-colors duration-300">
              <h2 className="text-xl mb-6 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Review Results
              </h2>

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                  <p className="text-teal-600 dark:text-teal-400 font-medium animate-pulse">Running AI Analysis...</p>
                </div>
              )}

              {!isAnalyzing && !results && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500">
                  <svg className="w-12 h-12 mb-3 opacity-20" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  <p>Awaiting submission...</p>
                </div>
              )}

              {!isAnalyzing && results && (
                <div className="space-y-8 animate-fadeIn">

                  {/* Score & Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Quality Score</p>
                      <p className="text-5xl font-black text-teal-600 dark:text-teal-400">{results.score}<span className="text-2xl text-slate-400">/100</span></p>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Overview</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{results.summary}</p>
                    </div>
                  </div>

                  {/* Issue Cards */}
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      Detailed Feedback
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">{results.issues.length}</span>
                    </h3>

                    <div className="space-y-4 pr-1">
                      {results.issues.map((issue, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-[#1E1E2E] p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all hover:border-slate-300 dark:hover:border-slate-600">

                          <div className="flex justify-between items-start mb-3 gap-4">
                            <h4 className="text-slate-800 dark:text-slate-100 font-bold text-lg">{issue.title}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getSeverityStyle(issue.severity)} whitespace-nowrap`}>
                              {issue.severity}
                            </span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{issue.explanation}</p>

                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                              {issue.category}
                            </span>
                            {issue.lineReference && (
                              <span className="text-slate-500 dark:text-slate-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                {issue.lineReference}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;