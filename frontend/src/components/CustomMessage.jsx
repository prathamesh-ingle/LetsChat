// src/components/CustomMessage.jsx
import { useMessageContext, MessageSimple } from "stream-chat-react";

const CustomMessage = (props) => {
  const { message } = useMessageContext();

  // Hide deleted messages completely
  if (message?.deleted_at || message?.type === "deleted") {
    return null;
  }

  // Use Stream's default message bubble (supports links)
  return <MessageSimple {...props} />;
};

export default CustomMessage;
