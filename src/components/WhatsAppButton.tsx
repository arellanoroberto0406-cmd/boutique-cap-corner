import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const whatsappUrl = "https://l.facebook.com/l.php?u=https%3A%2F%2Fapi.whatsapp.com%2Fsend%2F%3Fphone%3D523251120730%26text%26type%3Dphone_number%26app_absent%3D0%26wame_ctl%3D1%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExYXFEcWN4aFZHRmNDSmUzRnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5vPNd1Ph6ooN3pXIrF-kGN8F97BXRy3E1S1Iz5T7LT5xP1J1d9L46KQl74iA_aem_quUv3hKJllEkt5d8fW9dtw&h=AT0Xeg0CxW5oQ79Gnd4dj46Tr7YKVawf83hiY7-3B30RwHR982v02xXvPlHM3NREaNi44pTdemqoRpg8ogfxAtR73ecmXtLRMUg5WZ9FJS0pQ9gkw1fHF6lglsD7zFbK5HjUC_mWUBpjrDezchg6EA";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        ¡Chatea con nosotros!
      </span>
    </a>
  );
};

export default WhatsAppButton;
