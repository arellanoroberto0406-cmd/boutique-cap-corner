import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import AriaChat from "./AriaChat";
import { useCart } from "@/context/CartContext";

const AriaChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPaid } = useCart();

  if (hasPaid) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
        aria-label="Abrir chat con ARIA"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && <AriaChat onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default AriaChatButton;
