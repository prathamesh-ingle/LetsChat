// src/pages/CallPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callError, setCallError] = useState(null);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const navigate = useNavigate();

  const initCall = useCallback(async () => {
    if (!tokenData?.token || !authUser || !callId) {
      setIsConnecting(false);
      return;
    }

    try {
      console.log("Initializing Stream video client for callId:", callId);
      
      // Validate callId format (should be underscore-separated user IDs)
      if (!/^[a-zA-Z0-9_]+$/.test(callId)) {
        throw new Error("Invalid call ID format");
      }

      const user = {
        id: authUser._id,
        name: authUser.fullName,
        image: authUser.profilePic || undefined,
      };

      const videoClient = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user,
        token: tokenData.token,
        options: {
          // Enable logging for debugging
          logLevel: 'warn',
        },
      });

      const callInstance = videoClient.call("default", callId);
      
      // Get or create call first, then join
      await callInstance.getOrCreate();
      await callInstance.join({ create: true });

      console.log("Joined call successfully:", callInstance.id);
      
      setClient(videoClient);
      setCall(callInstance);
      setCallError(null);
    } catch (error) {
      console.error("Error joining call:", error);
      
      let errorMessage = "Could not join the call. Please try again.";
      
      if (error.message?.includes("permission")) {
        errorMessage = "You don't have permission to join this call.";
      } else if (error.message?.includes("invalid")) {
        errorMessage = "Invalid call ID. Please start a new call.";
      } else if (error.message?.includes("token")) {
        errorMessage = "Authentication failed. Please refresh the page.";
      }
      
      setCallError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [tokenData?.token, authUser, callId]);

  useEffect(() => {
    initCall();
  }, [initCall]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (client && call) {
        call.leave();
        client.disconnectUser();
      }
    };
  }, [client, call]);

  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  if (callError && !client) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">📹</div>
          <h2 className="text-2xl font-bold text-base-content mb-2">
            Call Unavailable
          </h2>
          <p className="text-base-content/60 mb-6">{callError}</p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
            <button onClick={() => navigate(-1)} className="btn btn-ghost">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="h-screen flex items-center justify-center bg-base-100">
          <div className="text-center p-8">
            <p className="text-base-content/50">
              Initializing call...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Redirect when call ends/left
  if (callingState === CallingState.LEFT || callingState === CallingState.INACTIVE) {
    navigate("/", { replace: true });
    return null;
  }

  // Show connecting state
  if (callingState === CallingState.CONNECTING) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-base-900 to-base-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme appearance={{ colors: { accent: '#22c55e' } }}>
      <div className="h-full flex flex-col">
        <SpeakerLayout />
        <CallControls />
      </div>
    </StreamTheme>
  );
};

export default CallPage;
