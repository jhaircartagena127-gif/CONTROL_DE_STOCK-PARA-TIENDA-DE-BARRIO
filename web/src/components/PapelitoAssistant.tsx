import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Store,
  CalendarCheck, 
  ExternalLink,
  PackageCheck,
  CheckCircle2,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.ts';
import { ClippyAvatar, ClippyState } from './ClippyAvatar.tsx';

interface Message {
  id: string;
  sender: 'user' | 'papelito';
  text: string;
  time: string;
  accion?: any;
}

interface PapelitoAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
  initialQuery?: string;
  isTabMode?: boolean;
}

export const PapelitoAssistant: React.FC<PapelitoAssistantProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  initialQuery,
  isTabMode = false
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'papelito',
      text: '¡Hola casero! Soy **Papelito**, tu ayudante de confianza en la tienda. Puedo decirte qué productos te falta comprar, cuánto dinero tienes en mercadería, qué cosas están por vencer o agendar las visitas de tus distribuidores. ¿En qué te ayudo hoy?',
      time: 'Ahora'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Inicializar Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-PE'; // O es-ES / es-MX

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Función Text-to-Speech con voz amable
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/•/g, '')
      .replace(/<<.*?>>/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Lucia') || v.name.includes('Jorge') || v.name.includes('Google')));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta micrófono directo. Puedes escribir tu consulta en el casillero.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.chatPapelito(userMsg.text);

      if (data.ok) {
        const papelitoMsg: Message = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'papelito',
          text: data.respuesta,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          accion: data.accion
        };

        setMessages(prev => [...prev, papelitoMsg]);

        if (data.accion) {
          confetti({ particleCount: 40, spread: 60 });
          setHasCelebrated(true);
          setTimeout(() => setHasCelebrated(false), 3000);
          if (onDataChanged) {
            onDataChanged();
          }
        }

        if (ttsEnabled) {
          speakText(data.respuesta);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'papelito',
            text: 'Disculpa casero, tuve un problemita al consultar el sistema: ' + (data.error || 'Error de conexión'),
            time: 'Ahora'
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'papelito',
          text: 'Error de conexión con el servidor de la tienda.',
          time: 'Ahora'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '¿Qué me falta comprar hoy?',
    '¿Cuánto dinero tengo en mercadería?',
    '¿Qué productos están por vencer?',
    'Agenda que el distribuidor de lácteos viene el viernes a las 10 AM',
    '¿Cuáles son los teléfonos de mis proveedores?'
  ];

  const currentClippyState: ClippyState = hasCelebrated
    ? 'celebrating'
    : isSpeaking
    ? 'talking'
    : loading || isListening
    ? 'thinking'
    : 'idle';

  if (!isOpen && !isTabMode) return null;

  const containerClasses = isTabMode
    ? 'w-full bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden'
    : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[480px] h-[600px] max-h-[88vh] z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden';

  return (
    <div className={containerClasses}>
      
      {/* Cabecera amigable del asistente con Clippy */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 text-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="shrink-0 bg-white/30 p-1 rounded-2xl">
            <ClippyAvatar size="md" state={currentClippyState} showBadge={true} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 leading-tight flex items-center gap-1.5">
              <span>Clippy</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 font-black px-2 py-0.5 rounded-full">
                IA Tienda
              </span>
            </h3>
            <p className="text-xs text-amber-950 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              Tu ayudante animado con voz
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Voz */}
          <button
            onClick={() => {
              if (ttsEnabled) {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              }
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? 'Voz activada (silenciar)' : 'Voz desactivada (activar locución)'}
            className={`p-2 rounded-xl transition ${
              ttsEnabled ? 'bg-amber-600 text-white' : 'bg-white/30 text-amber-950'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isTabMode && (
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              title="Cerrar ventana"
              className="p-2 text-amber-950 hover:bg-black/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Onda Sonora si está hablando */}
      {isSpeaking && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-bounce text-amber-700" />
            <span className="font-bold">Papelito está hablando en voz alta...</span>
          </div>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
            }}
            className="text-xs text-amber-800 font-extrabold underline"
          >
            Callar voz
          </button>
        </div>
      )}

      {/* Lista de Mensajes del Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-semibold rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-1.5">
                {msg.text.split('\n').map((line, i) => {
                  const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return (
                    <p
                      key={i}
                      dangerouslySetInnerHTML={{ __html: formatted }}
                      className={line.startsWith('•') ? 'pl-2 text-slate-900 font-medium' : ''}
                    />
                  );
                })}
              </div>

              {/* Acciones ejecutadas */}
              {msg.accion && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  {msg.accion.tipo === 'cita_agendada' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                      <div className="flex items-center justify-between font-black text-emerald-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="w-4 h-4 text-emerald-600" />
                          ¡Visita Agendada en tu Calendario!
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p>Proveedor: <strong>{msg.accion.cita.proveedor}</strong></p>
                      <p>Fecha y Hora: <strong>{msg.accion.cita.fecha} a las {msg.accion.cita.hora}</strong></p>
                      {msg.accion.cita.google_calendar_url && (
                        <a
                          href={msg.accion.cita.google_calendar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          <span>Ver en Google Calendar</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {msg.accion.tipo === 'stock_modificado' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                      <div className="flex items-center gap-1.5 font-bold text-blue-800 mb-1">
                        <PackageCheck className="w-4 h-4" />
                        <span>Stock de tienda actualizado</span>
                      </div>
                      <p>Producto: <strong>{msg.accion.producto.nombre}</strong></p>
                      <p>Nuevo inventario: <strong>{msg.accion.producto.stock_actual} {msg.accion.producto.unidad_medida}</strong></p>
                    </div>
                  )}
                </div>
              )}

              {/* Botón para volver a escuchar */}
              {msg.sender === 'papelito' && (
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{msg.time}</span>
                  <button
                    onClick={() => speakText(msg.text)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar en voz alta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm py-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm max-w-[260px]">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="font-medium">Papelito está revisando tu tienda...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preguntas rápidas en botones */}
      <div className="px-4 py-2 border-t border-slate-200 bg-white flex gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Barra de escritura con botón de voz grande */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        {/* Botón de Micrófono Grande */}
        <button
          onClick={toggleMic}
          title={isListening ? 'Escuchando... Toca para detener' : 'Hablar por micrófono'}
          className={`p-3 rounded-2xl transition shadow-sm ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={isListening ? 'Habla ahora, Papelito te escucha...' : 'Pregúntale a Papelito (ej: ¿Qué falta comprar hoy?)...'}
          className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-emerald-600/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
