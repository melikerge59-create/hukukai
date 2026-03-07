import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
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

    if (data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMessage,
        category: categoryId,
        conversationId: currentConversation?.id,
        fileContent: fileContent || undefined
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
        if (data) {
          setCurrentConversation(data);
        }
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button onClick={onBack} variant="ghost" size="sm" className="mb-4 w-full">
            <ArrowLeft size={18} className="mr-2" />
            Kategorilere Dön
          </Button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {category?.name || 'Sohbetler'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {userPlan?.daily_limit || 5} soru/gün
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Button onClick={startNewChat} variant="primary" size="sm" className="w-full mb-4">
              Yeni Sohbet
            </Button>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(conv.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              <p className="text-xl mb-2">Merhaba!</p>
              <p>Hukuki sorunuzu yazarak başlayın.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-6 py-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-md">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {fileName && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-900 dark:text-blue-300">{fileName}</span>
              <button onClick={removeFile} className="text-blue-600 hover:text-blue-800">
                <X size={18} />
              </button>
            </div>
          )}
          <div className="flex space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              <Upload size={24} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Hukuki sorunuzu yazın..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Günlük Limit Aşıldı">
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Günlük soru limitinizi doldurdunuz. Premium plana yükselterek sınırsız soru sorabilirsiniz.
          </p>
          <Button onClick={onUpgrade} variant="primary" className="w-full">
            Planı Yükselt
          </Button>
        </div>
      </Modal>
    </div>
  );
}
