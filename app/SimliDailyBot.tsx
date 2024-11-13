import React, { useCallback, useEffect, useRef, useState } from "react";
import { SimliClient } from "simli-client";
import { RTVIClient, RTVIClientConfigOption, RTVIError, RTVIEvent } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { RTVIClientAudio, RTVIClientProvider, useRTVIClientEvent } from "realtime-ai-react";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";

interface SimliDailyBotProps {
  simli_faceid: string;
  stt: string;
  llm: string;
  tts: string;
  config: RTVIClientConfigOption[];
  onStart: () => void;
  onClose: () => void;
  showDottedFace?: boolean;
}

const simliClient = new SimliClient();

const SimliDailyBot: React.FC<SimliDailyBotProps> = ({
  simli_faceid,
  stt,
  llm,
  tts,
  config,
  onStart,
  onClose,
  showDottedFace = false,
}) => {
  // State management
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  /**
   * Handles the start of the interaction
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();

    try {
      initializeSimliClient();

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start Simli client
      await simliClient?.start();
      eventListenerSimli();

      // Initialize Daily Voice Client
      initializeDailyVoiceClient();
    } catch (error: any) {
      console.error("Error starting interaction:", error);
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [onStart]);

  /**
   * Handles stopping the interaction
   */
  const handleStop = useCallback(() => {
    console.log("Stopping interaction...");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);

    // Clean up clients
    simliClient?.close();
    voiceClient?.disconnect();

    onClose?.();
    console.log("Interaction stopped");
  }, [onClose, voiceClient]);

  /**
   * Initialize the Simli client
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Initialize the Daily Voice Client
   */
  const initializeDailyVoiceClient = () => {
    if (voiceClient) {
      return;
    }

    const newVoiceClient = new RTVIClient({
      transport: new DailyTransport(),
      params: {
        baseUrl: `/api`,
        requestData: {
          services: {
            stt: stt,
            tts: tts,
            llm: llm,
          },
        },
        endpoints: {
          connect: "/connect",
          action: "/actions",
        },
        config : config
      },
      callbacks: {
        onBotReady: () => {
          console.log("Daily Voice Client connected");
          setIsAvatarVisible(true);
          getAudioElementAndSendToSimli();
        }
      },
    });

    setVoiceClient(newVoiceClient);
    connectDailyVoiceClient(newVoiceClient);
    console.log("Daily Voice Client initialized");
  };

  /**
   * Connect Daily Voice Client
   */
  const connectDailyVoiceClient = async (client: RTVIClient) => {
    if (!client) return;

    try {
      console.log("Connecting to Daily Voice Client...");
      await client.connect();
    } catch (e) {
      setError((e as RTVIError).message || "Unknown error occured");
      console.error("Error connecting to Daily Voice Client:", e);
      client.disconnect();
    }
  };

  /**
   * Get audio element and send to Simli
   */
  const getAudioElementAndSendToSimli = () => {
    if (simliClient) {
      const audioElements = document.getElementsByTagName("audio");

      for (let i = 0; i < audioElements.length; i++) {
        if (audioElements[i].id !== "simli_audio") {
          audioElements[i].muted = true;
          console.log("Sending audio element to Simli:", audioElements[i]);
          simliClient.listenToMediastreamTrack(
            (audioElements[i] as any).captureStream().getTracks()[0]
          );
          return;
        }
      }
    } else {
      setTimeout(getAudioElementAndSendToSimli, 10);
    }
  };

  /**
   * Simli Event listeners
   */
  const eventListenerSimli = useCallback(() => {
    if (simliClient) {
      simliClient?.on("connected", () => {
        console.log("SimliClient connected");
        const audioData = new Uint8Array(6000).fill(0);
        simliClient?.sendAudioData(audioData);
        // Start DailyBot interaction
        // connectDailyVoiceClient();
        console.log("Sent initial audio data");
      });

      simliClient?.on("disconnected", () => {
        console.log("SimliClient disconnected");
      });
    }
  }, []);

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     simliClient?.close();
  //     voiceClient?.disconnect();
  //   };
  // }, [voiceClient]);

  return (
    <>
      <div
        className={`transition-all duration-300 ${
          showDottedFace ? "h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <RTVIClientProvider client={voiceClient!}>
          <>
            <RTVIClientAudio />
          </>
        </RTVIClientProvider>
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
      <div className="flex flex-col items-center">
        {!isAvatarVisible ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold w-[164px]">
                Start Interaction
              </span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={handleStop}
              className={cn(
                "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
              )}
            >
              <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                Stop Interaction
              </span>
            </button>
          </div>
        )}
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>
    </>
  );
};

export default SimliDailyBot;
