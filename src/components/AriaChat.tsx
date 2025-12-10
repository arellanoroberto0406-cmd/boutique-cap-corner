import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Package, CheckCircle, Truck, HelpCircle, ShoppingBag, CreditCard, Star, MapPin, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  image_url: string;
}

interface AriaChatProps {
  onClose: () => void;
}

const quickActions = [
  { label: "Rastrear Pedido", message: "Quiero rastrear mi pedido", icon: Package, color: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500" },
  { label: "Confirmar Pago", message: "Quiero confirmar mi pago", icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 hover:border-green-500" },
  { label: "Ver Catálogo", message: "Muéstrame productos disponibles", icon: ShoppingBag, color: "bg-pink-500/10 text-pink-600 border-pink-500/30 hover:bg-pink-500/20 hover:border-pink-500", showProducts: true },
  { label: "Métodos de Pago", message: "¿Cuáles son los métodos de pago disponibles?", icon: CreditCard, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500" },
  { label: "Estado de Envío", message: "¿Cuál es el estado de mi envío?", icon: Truck, color: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500" },
  { label: "Envío Gratis", message: "¿Cuánto necesito comprar para envío gratis?", icon: Star, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500" },
  { label: "Ubicación", message: "¿Dónde están ubicados? Quiero saber la dirección completa", icon: MapPin, color: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 hover:border-red-500" },
  { label: "Ayuda", message: "Necesito ayuda con mi pedido", icon: HelpCircle, color: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500" },
];

const AriaChat = ({ onClose }: AriaChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy ARIA, tu asistente virtual de Proveedor Boutique AR. ¿En qué puedo ayudarte hoy? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductsInChat, setShowProductsInChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, products]);

  const fetchProducts = async () => {
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aria-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "get_products" }),
      });

      if (response.ok) {
        const data = await response.json();
        const allProducts: Product[] = [
          ...(data.brandProducts || []),
          ...(data.estuches || []),
          ...(data.pines || []),
        ];
        setProducts(allProducts.slice(0, 6));
        setShowProductsInChat(true);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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

      // Check if should show products based on content
      const lowerContent = assistantContent.toLowerCase();
      if (lowerContent.includes("producto") || lowerContent.includes("catálogo") || lowerContent.includes("gorra") || lowerContent.includes("mostrar")) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No pude conectarme con ARIA. Por favor intenta de nuevo.",
        variant: "destructive",
      });
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

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    if (isLoading) return;
    
    // Si es rastrear pedido, navegar a la página
    if (action.message.includes("rastrear")) {
      navigate("/rastrear-pedido");
      onClose();
      return;
    }

    const userMessage: Message = { role: "user", content: action.message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowQuickActions(false);

    // If this action should show products, fetch them
    if (action.showProducts) {
      await fetchProducts();
    }

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="flex-shrink-0 w-32 bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {product.sale_price && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            Oferta
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          {product.sale_price ? (
            <>
              <span className="text-xs font-bold text-primary">${product.sale_price}</span>
              <span className="text-[10px] text-muted-foreground line-through">${product.price}</span>
            </>
          ) : (
            <span className="text-xs font-bold text-primary">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 w-[380px] h-[650px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
            A
          </div>
          <div>
            <h3 className="font-bold text-base">ARIA</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Asistente Virtual
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
          <X className="h-5 w-5" />
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
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Product Cards */}
        {showProductsInChat && products.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Productos destacados:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

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
                    onClick={() => handleQuickAction(action)}
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
            <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs text-muted-foreground">ARIA está escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 rounded-full bg-background"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="rounded-full h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AriaChat;