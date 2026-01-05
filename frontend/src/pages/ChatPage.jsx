// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import CustomMessage from "../components/CustomMessage";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("_");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = async () => {
    if (!channel) return;

    const callId = channel.id;
    const callUrl = `${window.location.origin}/call/${callId}`;

    try {
      await channel.sendMessage({
        text: `Join video call: ${callUrl}`,
      });

      toast.success("Video call link sent!");
      window.open(callUrl, "_blank");
    } catch (err) {
      console.error("Error sending call message", err);
      toast.error("Could not start the call.");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    // FULL PAGE FLEX COLUMN, NO SCROLL HERE
    <div className="h-[93vh] flex flex-col">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          {/* THIS WRAPPER ALSO FLEX COLUMN, NO SCROLL */}
          <div className="flex-1 flex flex-col bg-base-100">
            {/* FIXED TOP BAR */}
            <div className="shrink-0 border-b border-base-300 bg-base-100/95 flex items-center justify-between px-3 py-2">
              <p className="text-xs text-base-content/60">
                End-to-end encrypted chat
              </p>
              <CallButton handleVideoCall={handleVideoCall} />
            </div>

            {/* ONLY THIS PART SCROLLS */}
            <div className="flex-1 min-h-0">
              <Window className="h-full flex flex-col">
                <ChannelHeader />

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <MessageList
                    Message={CustomMessage}
                    messageActions={["edit", "delete", "react", "reply"]}
                    className="px-2"
                  />
                </div>

                <MessageInput focus />
              </Window>
            </div>

            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
                                