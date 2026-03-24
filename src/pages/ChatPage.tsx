import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, Upload, X, Plus, Scale, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { getCategoryInfo } from '../lib/categories';
import { sendChatMessage } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../types';

interface ChatPageProps {
  categoryId: string;
  onBack: () => void;
  onUpgrade: () => void;
}

export function ChatPage({ categoryId, onBack, onUpgrade }: ChatPageProps) {
  const { user, userPlan } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const category = getCategoryInfo(categoryId as any);

  useEffect(() => {
    loadConversations();
  }, [categoryId]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', categoryId)
      .order('created_at', { ascending: false });
    if (data) setConversations(data);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content.substring(0, 50000));
    };
    reader.readAsText(file);
  };

  const removeFile = () => {
    setFileName('');
    setFileContent('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await sendChatMessage({
        message: userMessage,
        category: categoryId,
        conversationId: currentConversation?.id,
        fileContent: fileContent || undefined,
      });

      if (response.limitExceeded) {
        setShowLimitModal(true);
        setLoading(false);
        return;
      }

      if (!currentConversation) {
        await loadConversations();
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', response.conversationId)
          .single();
        if (data) setCurrentConversation(data);
      }

      await loadMessages(response.conversationId);
      removeFile();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setInput('');
    removeFile();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-surface-light dark:bg-surface-dark pt-16 overflow-hidden">

      {/* ─── Sidebar ─── */}
      <aside className="w-72 shrink-0 flex flex-col bg-white dark:bg-navy-950/60 border-r border-gray-200 dark:border-white/5">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Kategorilere Dön</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-navy-500 to-blue-600 shadow-glow-sm">
              <Scale size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {category?.name || 'Sohbetler'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {userPlan?.daily_limit === -1 ? 'Sınırsız' : (userPlan?.daily_limit || 5)} soru/gün
              </p>
            </div>
          </div>
        </div>

        {/* New chat button */}
        <div className="px-3 py-3 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl
              bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-500 hover:to-blue-500
              text-white text-sm font-semibold shadow-glow-sm hover:shadow-glow-md
              transition-all duration-200 active:scale-95"
          >
            <Plus size={16} />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-600">Henüz sohbet yok</p>
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                    currentConversation?.id === conv.id
                      ? 'bg-navy-50 dark:bg-navy-500/15 border border-navy-200 dark:border-navy-500/30'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <p className={`text-sm font-medium truncate leading-tight ${
                    currentConversation?.id === conv.id
                      ? 'text-navy-700 dark:text-navy-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    {new Date(conv.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Chat Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-500 to-blue-600 flex items-center justify-center shadow-glow-md mb-5">
                <Scale size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {category?.name} Danışmanı
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed text-sm">
                {category?.description}
                <br />
                <span className="mt-2 block">Sorunuzu aşağıya yazın, anında yanıt alın.</span>
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id}
                style={{ animationDelay: `${idx * 30}ms` }}
                className={`flex animate-fade-up animate-fill-both ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-navy-500 to-blue-600 flex items-center justify-center mr-3 mt-1 shadow-glow-sm">
                    <Scale size={14} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-2xl px-5 py-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'msg-user text-white rounded-br-sm shadow-glow-sm'
                      : 'msg-ai text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-blue-200/70' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center ml-3 mt-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-navy-500 to-blue-600 flex items-center justify-center mr-3 shadow-glow-sm">
                <Scale size={14} className="text-white" />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-bl-sm msg-ai shadow-card">
                <div className="flex items-center space-x-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{ animationDelay: `${i * 160}ms` }}
                      className="w-2 h-2 rounded-full bg-navy-400 dark:bg-navy-300 animate-typing-dot animate-fill-both"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input Bar ─── */}
        <div className="px-4 sm:px-8 py-4 bg-white dark:bg-navy-950/40 border-t border-gray-100 dark:border-white/5">
          {/* File attachment preview */}
          {fileName && (
            <div className="mb-3 flex items-center justify-between px-4 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-500/10 border border-navy-200 dark:border-navy-500/20">
              <div className="flex items-center space-x-2">
                <Upload size={14} className="text-navy-500 dark:text-navy-400" />
                <span className="text-sm font-medium text-navy-700 dark:text-navy-300 truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
              <button
                onClick={removeFile}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-500/20 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-end space-x-3">
            {/* File upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="shrink-0 p-2.5 rounded-xl text-gray-400 hover:text-navy-600 dark:hover:text-navy-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200 disabled:opacity-40 mb-0.5"
              title="Dosya ekle"
            >
              <Upload size={20} />
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Hukuki sorunuzu yazın... (Enter ile gönderin)"
                rows={1}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10
                  bg-gray-50 dark:bg-white/5
                  text-gray-900 dark:text-white text-sm
                  placeholder-gray-400 dark:placeholder-gray-600
                  focus:border-navy-400 dark:focus:border-navy-400
                  focus:bg-white dark:focus:bg-white/8
                  transition-all duration-200
                  resize-none overflow-hidden leading-relaxed
                  disabled:opacity-60"
                style={{ maxHeight: '160px' }}
              />
            </div>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-navy-600 to-blue-600 hover:from-navy-500 hover:to-blue-500
                text-white shadow-glow-sm hover:shadow-glow-md
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                transition-all duration-200 active:scale-95 mb-0.5"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-center text-gray-400 dark:text-gray-600">
            HukukAI genel bilgi amaçlıdır. Önemli hukuki kararlar için avukatınıza danışın.
          </p>
        </div>
      </div>

      {/* ─── Limit Modal ─── */}
      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)}>
        <div className="text-center space-y-5 py-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Loader2 size={28} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Günlük Limit Doldu
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Bugünkü soru hakkınızı kullandınız. Daha fazla soru sormak için planınızı yükseltin.
            </p>
          </div>
          <Button onClick={onUpgrade} variant="primary" className="w-full" size="lg">
            Planı Yükselt
            <ArrowLeft size={16} className="rotate-180" />
          </Button>
          <button
            onClick={() => setShowLimitModal(false)}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Yarın tekrar dene
          </button>
        </div>
      </Modal>
    </div>
  );
}
