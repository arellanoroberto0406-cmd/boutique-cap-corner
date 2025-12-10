import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Package, CheckCircle, Truck, HelpCircle, ShoppingBag, CreditCard, Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AriaChatProps {
  onClose: () => void;
}

const quickActions = [
  { label: "Rastrear Pedido", message: "Quiero rastrear mi pedido", icon: Package, color: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500" },
  { label: "Confirmar Pago", message: "Quiero confirmar mi pago", icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 hover:border-green-500" },
  { label: "Ver Catálogo", message: "¿Qué marcas de gorras tienen disponibles?", icon: ShoppingBag, color: "bg-pink-500/10 text-pink-600 border-pink-500/30 hover:bg-pink-500/20 hover:border-pink-500" },
  { label: "Métodos de Pago", message: "¿Cuáles son los métodos de pago disponibles?", icon: CreditCard, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500" },
  { label: "Estado de Envío", message: "¿Cuál es el estado de mi envío?", icon: Truck, color: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500" },
  { label: "Envío Gratis", message: "¿Cuánto necesito comprar para envío gratis?", icon: Star, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500" },
  { label: "Ubicación", message: "¿De dónde envían y cuánto tarda?", icon: MapPin, color: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 hover:border-red-500" },
  { label: "Ayuda", message: "Necesito ayuda con mi pedido", icon: HelpCircle, color: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500" },
];

const AriaChat = ({ onClose }: AriaChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy ARIA, tu asistente virtual de Proveedor Boutique AR. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aria-chat`;
    
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Error al conectar con ARIA");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      // Agregar mensaje del asistente vacío
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            // Ignorar errores de parsing
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No pude conectarme con ARIA. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      // Remover el último mensaje del asistente si hubo error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickActions(false);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleQuickAction = async (message: string) => {
    if (isLoading) return;
    
    // Si es rastrear pedido, navegar a la página
    if (message.includes("rastrear")) {
      navigate("/rastrear-pedido");
      onClose();
      return;
    }

    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowQuickActions(false);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-background border border-border rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <div>
            <h3 className="font-semibold">ARIA</h3>
            <p className="text-xs text-muted-foreground">Asistente Virtual</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Quick Action Buttons */}
        {showQuickActions && messages.length === 1 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs text-muted-foreground text-center mb-3">¿En qué puedo ayudarte?</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${action.color} disabled:opacity-50 text-left`}
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isLoading}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs font-medium leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AriaChat;
