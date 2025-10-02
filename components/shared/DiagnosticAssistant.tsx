import React, { useState, useContext, useRef, useEffect } from 'react';
import { Bot, User, Send, X, Loader } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface DiagnosticAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiagnosticAssistant: React.FC<DiagnosticAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { ai, healthStatus, latestTelemetry, alerts } = useContext(AppContext)!;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !ai) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = `You are an expert AI diagnostic assistant for an Energy Management System (EMS).
Your role is to analyze the provided real-time system data and answer the operator's questions.
Provide clear, concise, and actionable insights. Focus on potential issues, root causes, and recommended actions.
Format your responses for clarity. Use markdown-style formatting like **bold** for emphasis and * bullet points for lists.
Do not just repeat the data; interpret it. Be proactive in identifying potential risks based on the data.`;

      const contextData = {
        healthStatus,
        latestTelemetry,
        activeAlerts: alerts.filter(a => a.status === 'active').slice(0, 5),
      };
      
      const prompt = `CONTEXT:
---
Here is the current system data in JSON format:
${JSON.stringify(contextData, null, 2)}
---
QUESTION:
${input}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
      });
      
      const aiResponseText = response.text;
      const aiMessage: Message = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: Message = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<li>$1</li>')
      .replace(/(\r\n|\n|\r)/g, '<br />');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end justify-end" onClick={onClose}>
        <div
            className="w-full max-w-md h-[80vh] bg-white dark:bg-gray-800 rounded-t-lg md:rounded-l-lg md:rounded-t-none shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={e => e.stopPropagation()}
            style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                    <Bot className="w-6 h-6 text-violet-500 mr-3" />
                    <h2 className="text-lg font-semibold">AI Diagnostic Assistant</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white"/></div>}
                        <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                           <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                        </div>
                         {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white"/></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white"/></div>
                        <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                           <Loader className="w-5 h-5 animate-spin text-gray-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about the system status..."
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-violet-600 text-white rounded-md disabled:bg-violet-800 disabled:cursor-not-allowed hover:bg-violet-700">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default DiagnosticAssistant;
