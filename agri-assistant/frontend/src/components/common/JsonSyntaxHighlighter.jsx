import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Code2 } from 'lucide-react';

export default function JsonSyntaxHighlighter({ data, title = 'agent_output.json' }) {
  const [copied, setCopied] = useState(false);

  const jsonString =
    typeof data === 'string'
      ? data
      : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl font-mono text-xs my-2">
      {/* IDE Code Window Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161b22] border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-2 font-mono">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            {title}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white transition-colors text-[10px] border border-white/5"
          title="Copy JSON to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Area */}
      <div className="overflow-x-auto max-h-[380px] p-2">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '0.75rem 1rem',
            background: 'transparent',
            fontSize: '11px',
            lineHeight: '1.5',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
          wrapLongLines={false}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
