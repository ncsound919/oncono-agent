import React, { useState, useRef, useEffect } from 'react';
import { PatientCase } from '../types/oncology';
import { askTumorBoardAgent } from '../services/apiClient';
import {
  MessageSquare,
  Send,
  Brain,
  User,
  Sparkles,
  RefreshCw,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface TumorBoardChatProps {
  patientCase: PatientCase;
}

export const TumorBoardChat: React.FC<TumorBoardChatProps> = ({ patientCase }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `I am Onco Agent, your Molecular Tumor Board decision-support specialist. I have loaded patient ${patientCase.patientRef} (${patientCase.cancerType}, ${patientCase.stage}) with ${patientCase.genomicAlterations.length} somatic alterations: ${patientCase.genomicAlterations.map((a) => `${a.gene} ${a.hgvsProtein.split(' ')[0]}`).join(', ')}. How can I assist with therapeutic sequencing, resistance mechanisms, or clinical trial matching?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat when case changes
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: `Loaded patient ${patientCase.patientRef} (${patientCase.cancerType}, ${patientCase.stage}) with ${patientCase.genomicAlterations.length} somatic alterations: ${patientCase.genomicAlterations.map((a) => `${a.gene} ${a.hgvsProtein.split(' ')[0]}`).join(', ')}. Ask me about line-of-therapy options, resistance circuits, or trial eligibility.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [patientCase.id]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { answer } = await askTumorBoardAgent(patientCase, textToSend.trim(), history);

      const agentMsg: ChatMessage = {
        role: 'model',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        role: 'model',
        content: `Clinical reasoning engine error: ${
          err instanceof Error ? err.message : 'Unknown communication error'
        }. Please verify that GEMINI_API_KEY is configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Contextual suggested clinical prompts
  const samplePrompts = [
    patientCase.cancerType.includes('Lung')
      ? 'What is the standard of care for osimertinib progression with CNS vs systemic relapse?'
      : patientCase.cancerType.includes('Colorectal')
      ? 'What are the investigational KRAS G12D inhibitor trials and mechanism of bypass resistance?'
      : patientCase.cancerType.includes('Ovarian')
      ? 'How should we sequence PARP maintenance in this BRCA1/HRD+ patient?'
      : 'What are the key trial inclusion criteria and toxicity risks for this patient profile?',
    'How does the patient\'s organ function (eGFR, bilirubin, QTc) impact regimen selection?',
    'Is checkpoint immunotherapy recommended based on MSI/TMB/PD-L1 markers?',
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[540px] font-sans">
      {/* Header */}
      <div className="p-3.5 sm:px-4 bg-slate-900 text-white rounded-t-lg flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-100">
            Interactive Tumor Board Agent (Gemini 3.8 Flash)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-teal-400">
          Case Context: {patientCase.patientRef}
        </span>
      </div>

      {/* Message history */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40 text-xs">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold ${
                  isUser ? 'bg-indigo-600' : 'bg-blue-800'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed space-y-1 shadow-2xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-3 text-[10px] font-mono pb-1 border-b ${
                    isUser ? 'border-indigo-500 text-indigo-200' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="font-semibold uppercase">
                    {isUser ? 'Clinician' : 'Onco Agent MTB Specialist'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line font-sans text-xs pt-0.5">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono pl-9">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Onco Agent is reasoning against clinical evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3.5 py-2 bg-slate-100/70 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Clinical Prompts:</span>
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isSending}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 transition text-[10px] truncate max-w-[260px] cursor-pointer"
            title={p}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white rounded-b-lg border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Onco Agent about molecular pathways, drug dosing, resistance, or trials..."
            disabled={isSending}
            className="flex-1 px-3 py-2 text-xs rounded border border-slate-300 font-sans focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-mono font-semibold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
