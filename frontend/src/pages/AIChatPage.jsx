// src/pages/AIChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [currentVoiceText, setCurrentVoiceText] = useState("");
  const [currentVoiceWords, setCurrentVoiceWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    const loadVoices = () => {
      if (typeof window === "undefined") return;
      const synth = window.speechSynthesis;
      if (!synth) return;

      if (synth.getVoices().length > 0) {
        setVoicesLoaded(true);
      } else {
        synth.onvoiceschanged = () => {
          if (synth.getVoices().length > 0) {
            setVoicesLoaded(true);
          }
        };
      }
    };
    loadVoices();
  }, [messages]);

  const toggleSpeakMessage = (content, messageId) => {
    if (!voicesLoaded || !content) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (speakingId === messageId) {
      synth.cancel();
      setSpeakingId(null);
      setCurrentVoiceText("");
      setCurrentVoiceWords([]);
      setCurrentWordIndex(-1);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const voices = synth.getVoices();
    const englishVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("en")) || voices[0];
    if (englishVoice) utterance.voice = englishVoice;

    const words = content.split(/\s+/).filter(Boolean);
    setSpeakingId(messageId);
    setCurrentVoiceText(content);
    setCurrentVoiceWords(words);
    setCurrentWordIndex(-1);

    utterance.onboundary = (event) => {
      if (event.name === "word" || event.charIndex >= 0) {
        const before = content.slice(0, event.charIndex);
        const index = before.trim().length
          ? before.trim().split(/\s+/).length - 1
          : 0;
        setCurrentWordIndex(index);
      }
    };

    utterance.onend = () => {
      setSpeakingId(null);
      setCurrentWordIndex(-1);
      setCurrentVoiceText("");
      setCurrentVoiceWords([]);
    };

    utterance.onerror = () => {
      console.warn("Speech synthesis failed");
      setSpeakingId(null);
      setCurrentWordIndex(-1);
      setCurrentVoiceText("");
      setCurrentVoiceWords([]);
    };

    synth.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const content = input.trim();

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const response = await axios.post("http://localhost:5001/api/ai/chat", {
        message: content,
        history: [...messages, userMsg]
      });

      console.log("AI response data:", response.data);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: response.data.role || "model",
        content: response.data.content || response.data.reply || ""
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(
        "AI chat error:",
        error?.response?.data || error.message || error
      );

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "model",
          content:
            error?.response?.data?.error ||
            "Sorry, AI is temporarily unavailable."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setCurrentVoiceText("");
    setCurrentVoiceWords([]);
    setCurrentWordIndex(-1);
    setMessages([]);
  };

  const placeholderShort = "Ask AI about your code…";
  const placeholderLong = "Paste errors, ask about React/Node.js/MongoDB...";

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      {/* Top bar */}
      <header className="border-b border-base-300/80 bg-base-100/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h5 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LetsChat AI Assistant
            </h5>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-base-content/60">
              Powered by Google Gemini 2.5 Flash
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] bg-success/10 text-success border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex justify-center relative">
        <div className="w-full max-w-5xl px-3 sm:px-6 py-3 sm:py-6 flex flex-col gap-3 sm:gap-4 pb-20 sm:pb-6">
          {/* Chat card */}
          <section className="flex-1 flex flex-col rounded-2xl sm:rounded-3xl border border-base-300 bg-base-200/60 backdrop-blur-sm shadow-lg overflow-hidden min-h-[60vh]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 pt-3 sm:pt-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
              {messages.length === 0 && (
                <div className="flex justify-center mt-4">
                  <div className="bg-base-100 border border-base-300/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-base-content/70 max-w-[90%]">
                    👨‍💻 Ask any question → Get instant answers + solutions 💬
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[90%] sm:max-w-[75%] px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${msg.role === "user"
                        ? "bg-primary text-primary-content rounded-br-sm"
                        : "bg-base-100 text-base-content rounded-bl-sm border border-base-300/80"
                      }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {msg.content || msg.reply}
                    </p>

                    {/* Voice controls - AI messages only */}
                    {msg.role !== "user" && voicesLoaded && (
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-base-content/60">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-end gap-[2px] h-3">
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${speakingId === msg.id
                                  ? "h-3 animate-[ping_1s_ease-in-out_infinite]"
                                  : "h-1 opacity-40"
                                }`}
                            />
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${speakingId === msg.id
                                  ? "h-2 animate-pulse"
                                  : "h-1 opacity-40"
                                }`}
                            />
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${speakingId === msg.id
                                  ? "h-3 animate-[ping_1s_ease-in-out_infinite_200ms]"
                                  : "h-1 opacity-40"
                                }`}
                            />
                          </div>
                          <span className="hidden xs:inline">
                            {speakingId === msg.id ? "Playing" : "Voice ready"}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleSpeakMessage(msg.content, msg.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] transition-all duration-200 shadow-sm ${speakingId === msg.id
                              ? "bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 border-primary/70 text-primary font-semibold scale-[1.04] shadow-primary/20"
                              : "bg-base-200/80 border-base-300/80 hover:bg-primary/10 hover:border-primary/60 hover:text-primary"
                            }`}
                          title={speakingId === msg.id ? "Stop voice" : "Listen to AI answer"}
                        >
                          <span>{speakingId === msg.id ? "⏹" : "🔊"}</span>
                          <span className="hidden xs:inline">
                            {speakingId === msg.id ? "Stop" : "Listen"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-base-100 text-base-content px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-bl-sm border border-base-300/80 shadow-sm">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-base-content/70">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Divider */}
            <div className="h-px bg-base-300/80 mx-3 sm:mx-5" />

            {/* Input area */}
            <div className="px-3 sm:px-5 py-2.5 sm:py-4 bg-base-200/80">
              <div className="flex flex-col gap-2">
                <div className="hidden sm:flex flex-wrap gap-2 text-[11px] text-base-content/60 mb-1">
                  <Link
                    to="/symptoms"
                    className=" relative flex hover:text-primary bg-base-300/80 rounded-full px-2 py-1 text-[11px]"
                  >

                    🩺 Symptoms Checker
                  </Link>
                  <Link
                    to="/Image"
                    className=" relative flex hover:text-primary bg-base-300/80 rounded-full px-2 py-1 text-[11px]"
                  >

                    🎨 Editorz
                  </Link>
                  <span className="px-2 py-1 rounded-full bg-base-300/80">
                    Shift + Enter = new line
                  </span>
                  <button
                    type="button"
                    onClick={clearChat}
                    className="ml-auto text-[11px] underline underline-offset-2 hover:text-primary"
                  >
                    Clear conversation
                  </button>
                </div>

                <div className="flex items-end gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder={placeholderShort}
                      data-long-placeholder={placeholderLong}
                      className="w-full resize-none max-h-40 bg-base-100/90 border border-base-300 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2.5 sm:py-3.5 pr-11 sm:pr-12 text-xs sm:text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 shadow-inner"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="hidden sm:flex items-center justify-center absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full bg-primary text-primary-content shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ➤
                    </button>
                  </div>

                  <div className="flex sm:hidden gap-2">
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="px-3 py-2 rounded-xl bg-primary text-primary-content text-xs font-medium shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                    <button
                      onClick={clearChat}
                      className="px-3 py-2 rounded-xl bg-base-300 text-[11px] text-base-content/80 hover:bg-base-300/80 transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={clearChat}
                    className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-2xl bg-base-300 text-[11px] text-base-content/80 hover:bg-base-300/80 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex sm:hidden justify-between items-center text-[10px] text-base-content/50 mt-0.5">
                  <span>Shift + Enter = new line</span>
                  <span>Gemini 2.5 · Free</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Global mini voice bar */}
        {currentVoiceText && currentVoiceWords.length > 0 && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 z-30 w-[96%] sm:w-auto max-w-xl">
            <div className="mx-auto bg-gradient-to-r from-base-100/95 via-base-100/90 to-base-100/95 border border-base-300/80 rounded-2xl shadow-2xl backdrop-blur-md px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (speakingId) {
                    if (
                      typeof window !== "undefined" &&
                      window.speechSynthesis
                    ) {
                      window.speechSynthesis.cancel();
                    }
                    setSpeakingId(null);
                    setCurrentVoiceText("");
                    setCurrentVoiceWords([]);
                    setCurrentWordIndex(-1);
                  }
                }}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-content shadow-md hover:bg-primary/90 text-xs sm:text-sm"
              >
                ⏹
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-base-content/80 truncate">
                  AI is reading this answer…
                </p>
                <p className="text-[10px] sm:text-xs text-base-content/70 line-clamp-2 sm:line-clamp-1">
                  {currentVoiceWords.map((w, i) => (
                    <span
                      key={i}
                      className={
                        i === currentWordIndex
                          ? "bg-primary/20 text-primary font-semibold rounded px-[2px] py-[1px]"
                          : ""
                      }
                    >
                      {w}
                      {i < currentVoiceWords.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-primary font-semibold">
                  Voice
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIChatPage;
