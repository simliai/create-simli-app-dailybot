"use client";
import React, { useEffect, useState } from "react";
import SimliDailyBot from "./SimliDailyBot";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";
import { RTVIClientConfigOption } from "realtime-ai";

interface avatarSettings {
  stt: "deepgram",
  tts: "cartesia",
  llm: "anthropic",
  simli_faceid: string;
  config: RTVIClientConfigOption[];
}

// Customize your avatar here
const avatar: avatarSettings = {
  stt: "deepgram",
  tts: "cartesia",
  llm: "anthropic",
  simli_faceid: "101bef0d-b62d-4fbe-a6b4-89bc3fc66ec6",
  config: [
    {
      service: "tts",
      options: [
        {
          name: "voice",
          value: "79a125e8-cd45-4c13-8a67-188112f4dd22",
        },
      ],
    },
    {
      service: "llm",
      options: [
        {
          name: "model",
          value: "claude-3-5-sonnet-latest",
        },
        {
          name: "initial_messages",
          value: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Act as you are a pirate.",
                },
              ],
            },
          ],
        },
        {
          name: "run_on_config",
          value: true,
        },
      ],
    },
  ],
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-white p-8">
      <SimliHeaderLogo />
      <Navbar />

      <div className="absolute top-[32px] right-[32px]">
        <text
          onClick={() => {
            window.open("https://github.com/simliai/create-simli-app-dailybot");
          }}
          className="font-bold cursor-pointer mb-8 text-xl leading-8"
        >
          <Image className="w-[20px] inline mr-2" src={GitHubLogo} alt="" />
          create-simli-app (DailyBot)
        </text>
      </div>
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
          {showDottedFace && <DottedFace />}
          <SimliDailyBot
            stt={avatar.stt}
            tts={avatar.tts}
            llm={avatar.llm}
            simli_faceid={avatar.simli_faceid}
            config={avatar.config}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
          />
        </div>
      </div>

      <div className="max-w-[350px] font-thin flex flex-col items-center ">
        <span className="font-bold mb-[8px] leading-5 ">
          {" "}
          Create Simli App is a starter repo for creating visual avatars with
          Simli{" "}
        </span>
        <ul className="list-decimal list-inside max-w-[350px] ml-[6px] mt-2">
          <li className="mb-1">
            Fill in your DailyBot and Simli API keys in .env file.
          </li>
          <li className="mb-1">
            Test out the interaction and have a talk with the DailyBot-powered,
            Simli-visualized avatar.
          </li>
          <li className="mb-1">
            You can replace the avatar's face and agent with your own. Do this
            by editing <code>app/page.tsx</code>.
          </li>
        </ul>
        <span className=" mt-[16px]">
          You can now deploy this app to Vercel, or incorporate it as part of
          your existing project.
        </span>
      </div>
    </div>
  );
};

export default Demo;
