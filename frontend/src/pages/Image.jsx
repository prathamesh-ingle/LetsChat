// src/pages/Image.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Image = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [currentVoiceText, setCurrentVoiceText] = useState("");
  const [currentVoiceWords, setCurrentVoiceWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [imageResults, setImageResults] = useState([]);
  const [videoResults, setVideoResults] = useState([]); // video results
  const [mode, setMode] = useState("image"); // "image" | "video"

  const messagesEndRef = useRef(null);

  // scroll container + button state
  const messagesContainerRef = useRef(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);

  // popup viewer state
  const [fullScreenImage, setFullScreenImage] = useState(null); // { url, prompt } or null

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

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 80;
      const distFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollToLatest(distFromBottom > threshold);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

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

  const downloadImage = async (url, prompt) => {
    try {
      const fileName = `ai-art-${prompt
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}.png`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image for download");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const generateImage = async () => {
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: `🎨 Generate: "${prompt}"`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setImageResults([]);
    setVideoResults([]); // clear videos when generating image
    setInput("");

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

      const response = await axios.post(`${backendUrl}/api/image/generate`, {
        prompt,
      });

      const { url } = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `✅ Your AI image has been generated! 🎉`,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setImageResults([
        { prompt, output: url, url, timestamp: Date.now() },
      ]);
    } catch (error) {
      console.error("Image generate error:", error);

      const errorMsg = {
        id: (Date.now() + 2).toString(),
        role: "model",
        content:
          `❌ Generation failed.\n\n` +
          `${error?.response?.data?.error || error.message}\n\n` +
          `💡 Try: "A cat in a wizard hat" or "Cyberpunk city at night"`,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // text-to-video using /api/image/video/generate
  const generateVideo = async () => {
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: `🎬 Generate video: "${prompt}"`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setVideoResults([]);
    setImageResults([]); // clear images when generating video
    setInput("");

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

      const response = await axios.post(
        `${backendUrl}/api/image/video/generate`,
        { prompt }
      );

      const { url } = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `✅ Your AI video has been generated! 🎉`,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setVideoResults([{ prompt, url, timestamp: Date.now() }]);
    } catch (error) {
      console.error("Video generate error:", error);

      const errorMsg = {
        id: (Date.now() + 2).toString(),
        role: "model",
        content:
          `❌ Video generation failed.\n\n` +
          `${error?.response?.data?.error || error.message}\n\n` +
          `💡 Try: "A cat walking on a keyboard in a neon room"`,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (mode === "image") {
        generateImage();
      } else {
        generateVideo();
      }
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
    setImageResults([]);
    setVideoResults([]);
  };

  const placeholderShort =
    mode === "image"
      ? "Describe your image…"
      : "Describe your short video…";
  const placeholderLong =
    mode === "image"
      ? "A cat in wizard hat, cyberpunk city, sunset beach..."
      : "A cat walking on a neon keyboard, a car driving through a rainy city...";

  return (
    // MAIN LAYOUT: allow middle to shrink
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      {/* Top bar */}
      <header className="border-b border-base-300/80 bg-base-100/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h5 className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              🎨 AI Media Generator
            </h5>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] bg-success/10 text-success border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex justify-center relative">
        <div className="w-full max-w-5xl px-3 sm:px-6 py-3 sm:py-6 flex flex-col gap-3 sm:gap-4 pb-20 sm:pb-6 min-h-0">
          {/* Chat card */}
          <section className="flex-1 min-h-0 flex flex-col rounded-2xl sm:rounded-3xl border border-base-300 bg-base-200/60 backdrop-blur-sm shadow-lg overflow-hidden">
            {/* Messages */}
            <div
              className="relative flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 pt-3 sm:pt-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4"
              ref={messagesContainerRef}
            >
              {messages.length === 0 && (
                <div className="flex justify-center mt-4">
                  <div className="bg-base-100 border border-base-300/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-base-content/70 max-w-[90%] text-center">
                    🎨 Type anything like "A cat in a wizard hat" or "Cyberpunk
                    city at night" to generate AI art or short video!
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[90%] sm:max-w-[75%] px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-content rounded-br-sm"
                        : "bg-base-100 text-base-content rounded-bl-sm border border-base-300/80"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {msg.content || msg.reply}
                    </p>

                    {msg.role !== "user" && voicesLoaded && (
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-base-content/60">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-end gap-[2px] h-3">
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${
                                speakingId === msg.id
                                  ? "h-3 animate-[ping_1s_ease-in-out_infinite]"
                                  : "h-1 opacity-40"
                              }`}
                            />
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${
                                speakingId === msg.id
                                  ? "h-2 animate-pulse"
                                  : "h-1 opacity-40"
                              }`}
                            />
                            <span
                              className={`w-[2px] rounded-full bg-primary/70 transition-all duration-300 ${
                                speakingId === msg.id
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
                          onClick={() =>
                            toggleSpeakMessage(msg.content, msg.id)
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] transition-all duration-200 shadow-sm ${
                            speakingId === msg.id
                              ? "bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 border-primary/70 text-primary font-semibold scale-[1.04] shadow-primary/20"
                              : "bg-base-200/80 border-base-300/80 hover:bg-primary/10 hover:border-primary/60 hover:text-primary"
                          }`}
                          title={
                            speakingId === msg.id
                              ? "Stop voice"
                              : "Listen to AI answer"
                          }
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

              {/* IMAGE RESULTS */}
              {imageResults.map((result, idx) => (
                <div
                  key={`result-${idx}`}
                  className="flex justify-center gap-3 flex-col sm:flex-row items-center"
                >
                  <div className="w-full max-w-md sm:max-w-lg bg-base-100/95 rounded-3xl shadow-2xl border border-base-300/90 overflow-hidden">
                    <div className="px-4 py-2 border-b border-base-300/80 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-base-content/80">
                        Image created
                      </span>
                      <span className="text-base-content/60">
                        • {result.prompt}
                      </span>
                    </div>

                    <div className="p-4 bg-base-200/60">
                      <div className="relative bg-base-200/50 rounded-2xl p-2 border border-base-300/70 shadow-inner">
                        <img
                          src={result.url}
                          alt={result.prompt}
                          className="w-full h-64 sm:h-72 object-contain rounded-xl shadow-2xl bg-gradient-to-br from-white/20 to-transparent"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden w-full h-64 sm:h-72 bg-gradient-to-br from-base-200/80 to-base-300/80 rounded-xl items-center justify-center text-base-content/60 text-sm">
                          Image loading... 🔄
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFullScreenImage({
                              url: result.url,
                              prompt: result.prompt,
                            })
                          }
                          className="flex-1 bg-base-100 border border-base-300 text-sm px-4 py-2.5 rounded-xl font-medium hover:bg-base-200 transition-colors flex items-center justify-center gap-2"
                        >
                          👁️ View full
                        </button>
                        <button
                          onClick={() =>
                            downloadImage(result.url, result.prompt)
                          }
                          className="flex-1 bg-primary text-primary-content text-sm px-4 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* VIDEO RESULTS */}
              {videoResults.map((result, idx) => (
                <div
                  key={`video-${idx}`}
                  className="flex justify-center gap-3 flex-col sm:flex-row items-center"
                >
                  <div className="w-full max-w-md sm:max-w-lg bg-base-100/95 rounded-3xl shadow-2xl border border-base-300/90 overflow-hidden">
                    <div className="px-4 py-2 border-b border-base-300/80 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-base-content/80">
                        Video created
                      </span>
                      <span className="text-base-content/60">
                        • {result.prompt}
                      </span>
                    </div>

                    <div className="p-4 bg-base-200/60">
                      <div className="relative bg-base-200/50 rounded-2xl p-2 border border-base-300/70 shadow-inner">
                        <video
                          src={result.url}
                          controls
                          className="w-full h-64 sm:h-72 rounded-xl bg-black object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-base-100 text-base-content px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-bl-sm border border-base-300/80 shadow-sm">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-accent rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-accent rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-base-content/70">
                        {mode === "image"
                          ? "🎨 AI is generating your image..."
                          : "🎬 AI is generating your video..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />

              {/* scroll to latest button inside messages container */}
              {showScrollToLatest && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute right-4 bottom-4 px-3 py-1.5 rounded-full bg-base-100/95 border border-base-300 text-[11px] shadow-md hover:bg-base-200 transition-colors flex items-center gap-1"
                >
                  ↓ Scroll to latest
                </button>
              )}
            </div>

            <div className="h-px bg-base-300/80 mx-3 sm:mx-5" />

            <div className="px-3 sm:px-5 py-2.5 sm:py-4 bg-base-200/80">
              <div className="flex flex-col gap-2">
                <div className="hidden sm:flex flex-wrap gap-2 text-[11px] text-base-content/60 mb-1">
                  <Link
                    to="/symptoms"
                    className="relative flex hover:text-primary bg-base-300/80 rounded-full px-2 py-1 text-[11px]"
                  >
                    🩺 Symptoms Checker
                  </Link>
                  <Link
                    to="/ai-chat"
                    className="relative flex hover:text-primary bg-base-300/80 rounded-full px-2 py-1 text-[11px]"
                  >
                    🤖 AI Assistant
                  </Link>
                  <button
                    type="button"
                    onClick={clearChat}
                    className="ml-auto text-[11px] underline underline-offset-2 hover:text-primary"
                  >
                    Clear history
                  </button>
                </div>

                {/* MODE TOGGLE */}
                <div className="flex items-center gap-2 mb-1 text-[11px] text-base-content/70">
                  <span className="mr-1">Mode:</span>
                  <button
                    type="button"
                    onClick={() => setMode("image")}
                    className={`px-2 py-1 rounded-full border text-[11px] ${
                      mode === "image"
                        ? "bg-primary text-primary-content border-primary"
                        : "bg-base-200 text-base-content/70 border-base-300"
                    }`}
                  >
                    🖼 Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("video")}
                    className={`px-2 py-1 rounded-full border text-[11px] ${
                      mode === "video"
                        ? "bg-secondary text-secondary-content border-secondary"
                        : "bg-base-200 text-base-content/70 border-base-300"
                    }`}
                  >
                    🎬 Video
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
                      className="w-full resize-none max-h-40 bg-base-100/90 border border-base-300 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2.5 sm:py-3.5 pr-11 sm:pr-12 text-xs sm:text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 shadow-inner"
                      disabled={loading}
                    />
                    <button
                      onClick={
                        mode === "image" ? generateImage : generateVideo
                      }
                      disabled={loading || !input.trim()}
                      className="hidden sm:flex items-center justify-center absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full bg-primary text-primary-content shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ➤
                    </button>
                  </div>

                  <div className="flex sm:hidden gap-2">
                    <button
                      onClick={
                        mode === "image" ? generateImage : generateVideo
                      }
                      disabled={loading || !input.trim()}
                      className="px-3 py-2 rounded-xl bg-accent text-accent-content text-xs font-medium shadow-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {mode === "image" ? "Generate" : "Generate video"}
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
                  <span>Bytez.js · Free AI Art & Video</span>
                </div>
              </div>
            </div>
          </section>
        </div>

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

        {/* THEME-AWARE GLASSY POPUP OVERLAY */}
        {fullScreenImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4
                   bg-base-300/40 sm:bg-base-300/50
                   backdrop-blur-sm sm:backdrop-blur-md"
            onClick={() => setFullScreenImage(null)}
          >
            <div
              className="relative w-full max-w-5xl max-h-[90vh]
                     bg-base-100/80 sm:bg-base-100/90
                     border border-base-300/70 sm:border-base-300
                     rounded-2xl sm:rounded-3xl
                     shadow-[0_18px_60px_rgba(0,0,0,0.45)]
                     backdrop-blur-md sm:backdrop-blur-xl
                     overflow-hidden
                     animate-[popup_220ms_ease-out]
                     flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TOP BAR */}
              <div
                className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-3 
                   bg-gradient-to-r from-base-200/90 via-base-100/80 to-base-200/90
                   border-b border-base-300/80
                   backdrop-blur-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error/80" />
                    <span className="w-2 h-2 rounded-full bg-warning/80" />
                    <span className="w-2 h-2 rounded-full bg-success/80" />
                  </div>
                  <span className="text-[11px] sm:text-sm font-medium text-base-content/90 truncate">
                    {fullScreenImage.prompt}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadImage(
                        fullScreenImage.url,
                        fullScreenImage.prompt
                      )
                    }
                    className="hidden xs:inline-flex items-center gap-1.5
                           px-3 py-1.5 text-[11px] sm:text-xs
                           bg-base-100/70 hover:bg-base-100
                           border border-base-300/80
                           text-base-content rounded-xl
                           backdrop-blur-sm
                           transition-all duration-150
                           shadow-sm hover:shadow-md"
                  >
                    ⬇ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullScreenImage(null)}
                    className="flex items-center justify-center
                           w-8 h-8 sm:w-9 sm:h-9
                           rounded-full
                           bg-base-red/90 hover:bg-base-red
                           border border-base-300/80
                           text-base-content text-sm sm:text-base
                           transition-all duration-150
                           backdrop-blur-sm
                           shadow-sm hover:shadow-md hover:scale-[1.04]"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* IMAGE AREA */}
              <div
                className="relative flex-1 flex items-center justify-center
                   bg-gradient-to-br from-base-300/90 via-base-200/90 to-base-300/90
                   px-2 sm:px-4 py-3 sm:py-4"
              >
                {/* soft glow behind image */}
                <div
                  className="pointer-events-none absolute inset-4 sm:inset-8
                           bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_62%)]
                           opacity-70"
                />
                <img
                  src={fullScreenImage.url}
                  alt={fullScreenImage.prompt}
                  className="relative z-10
                         max-h-[65vh] sm:max-h-[70vh]
                         w-auto max-w-full
                         object-contain
                         rounded-xl sm:rounded-2xl
                         shadow-2xl
                         transition-transform duration-200
                         hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden relative z-10 w-full h-full items-center justify-center">
                  <span className="text-base-content/80 text-sm sm:text-base">
                    🔄 Image loading...
                  </span>
                </div>
              </div>

              {/* BOTTOM STRIP (MOBILE-FRIENDLY) */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2
                   px-4 sm:px-6 py-2.5 sm:py-3
                   bg-base-100/90 border-t border-base-300/80 backdrop-blur-lg"
              >
                <p className="text-[10px] sm:text-xs text-base-content/70 line-clamp-2 sm:line-clamp-1">
                  Generated from: "{fullScreenImage.prompt}"
                </p>
                <button
                  type="button"
                  onClick={() =>
                    downloadImage(fullScreenImage.url, fullScreenImage.prompt)
                  }
                  className="inline-flex sm:hidden items-center justify-center gap-1.5
                         px-3 py-1.5 text-[11px]
                         bg-base-100/80 hover:bg-base-100
                         border border-base-300/80
                         text-base-content rounded-xl
                         backdrop-blur-sm
                         transition-all duration-150
                         shadow-sm"
                >
                  ⬇ Save image
                </button>
              </div>
            </div>

            {/* simple popup animation */}
            <style>{`
              @keyframes popup {
                0% { opacity: 0; transform: translateY(12px) scale(0.96); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
};

export default Image;
