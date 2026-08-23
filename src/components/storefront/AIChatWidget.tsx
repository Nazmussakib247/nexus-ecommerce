import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const botResponses = [
  "I'd be happy to help you find what you're looking for! Can you tell me more about what product category you're interested in?",
  "Great choice! Based on your preferences, I'd recommend checking out our bestselling Pro Wireless Headphones or the Ultra Slim Laptop. Would you like more details?",
  "We offer free shipping on orders over $50, and all items come with a 30-day return policy. Is there anything specific you'd like to know?",
  "I can help you track your order! Please share your order ID and I'll look it up for you right away.",
  "Our most popular items right now are the Running Shoes X1 and the Luxury Skincare Set. Would you like me to add either to your cart?",
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi there! 👋 I'm Nexus AI, your shopping assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(
      () => {
        const response =
          botResponses[Math.floor(Math.random() * botResponses.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
          },
        ]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1500,
    );
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-110",
          open && "rotate-90",
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border bg-card shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Nexus AI Assistant</p>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
                    msg.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "assistant"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-secondary rounded-xl px-4 py-2">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-lg flex-shrink-0"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
