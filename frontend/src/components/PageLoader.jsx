// src/components/PageLoader.jsx
import React from "react";
import { MessageCircleMore } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-base-100"
      data-theme={theme}
    >
      <div className="relative">
        {/* Soft glow */}
        <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/10 opacity-70" />

        {/* Smaller compact pill loader */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-100/95 border border-base-content/10 shadow-lg shadow-primary/20 backdrop-blur-md">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base-100 shadow-md">
            <MessageCircleMore className="size-3.5" />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-medium tracking-wide">
              Connecting to LetsChat
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]" />
              <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:0s]" />
              <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
