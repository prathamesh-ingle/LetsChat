// src/components/CallButton.jsx
import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <button
      onClick={handleVideoCall}
      className="
        inline-flex items-center justify-center
        h-9 w-9 rounded-full
        bg-success/90 hover:bg-success
        text-white transition-colors
        shadow-md
      "
      title="Start video call"
    >
      <VideoIcon className="size-4" />
    </button>
  );
}

export default CallButton;
