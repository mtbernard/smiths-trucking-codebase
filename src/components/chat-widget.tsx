import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, Truck, X, RotateCcw } from "lucide-react";

const KEY = "stc-chat";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [initial, setInitial] = useState<UIMessage[]>([]);
  useEffect(() => {
    try { setInitial(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
    setReady(true);
  }, []);
  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Chat with us" className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg">
          <MessageCircle className="h-5 w-5" />Chat
        </button>
      )}
      {open && ready && <ChatPanel initial={initial} onClose={() => setOpen(false)} onReset={() => setInitial([])} />}
    </>
  );
}

function ChatPanel({ initial, onClose, onReset }: { initial: UIMessage[]; onClose: () => void; onReset: () => void }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status !== "streaming") { try { localStorage.setItem(KEY, JSON.stringify(messages.slice(-40))); } catch { /* ignore */ } }
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);

  function send() {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[min(600px,calc(100vh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border bg-card shadow-2xl">
      <div className="flex items-center gap-2 bg-navy px-4 py-3 text-navy-foreground">
        <Truck className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1"><p className="font-display text-lg font-bold uppercase leading-none">Smith's Assistant</p><p className="text-xs opacity-70">Trucks, financing & more</p></div>
        <button onClick={() => { stop(); setMessages([]); localStorage.removeItem(KEY); onReset(); }} aria-label="New conversation" title="New conversation"><RotateCcw className="h-4 w-4" /></button>
        <button onClick={onClose} aria-label="Close chat"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <div className="space-y-2 text-muted-foreground">
            <p>Hi! I can help you find a truck, explain financing, or connect you with our team.</p>
            {["What sleepers do you have under $110k?", "How does financing work?", "What are your hours?"].map((q) => (
              <button key={q} onClick={() => sendMessage({ text: q })} className="block rounded-full border px-3 py-1 text-left text-xs hover:text-foreground">{q}</button>
            ))}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-8 rounded-md bg-primary px-3 py-2 text-primary-foreground" : "mr-4"}>
            {m.parts.map((p, i) => p.type === "text" ? (
              m.role === "user" ? <p key={i} className="whitespace-pre-wrap">{p.text}</p> :
              <div key={i} className="space-y-2 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                <ReactMarkdown components={{ a: ({ href, children }) => href?.startsWith("/") ? <Link to={href}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{p.text}</ReactMarkdown>
              </div>
            ) : null)}
          </div>
        ))}
        {status === "submitted" && <p className="animate-pulse text-muted-foreground">Typing…</p>}
        {error && <p className="text-destructive">Sorry, something went wrong. Please try again.</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t p-3">
        <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about trucks or financing…" className="field max-h-28 min-h-[40px] flex-1 resize-none" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
