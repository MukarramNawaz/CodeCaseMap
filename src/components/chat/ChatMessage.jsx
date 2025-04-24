import ReactMarkdown from "react-markdown";
import Logo from "../../assets/CaseMap logo.png";
import React, { useEffect, useState } from "react";
import {
  ThumbsDownIcon,
  ThumbsUpIcon,
  Copy,
  X,
  ArrowUpRight,
} from "lucide-react";
import { BsDatabaseFillGear } from "react-icons/bs";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import remarkGfm from "remark-gfm";
// import axios from 'axios';
function ChatMessage({ message, convId }) {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.user);
  const isAI = message.role === "assistant";
  const documents = message.role === "assistant" ? message.sources : [];
  const [thumbsUpActive, setThumbsUpActive] = useState(
    message.user_sentiment === "liked"
  );
  const [thumbsDownActive, setThumbsDownActive] = useState(
    message.user_sentiment === "disliked"
  );
  const [showSources, setShowSources] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setThumbsUpActive(message.user_sentiment === "liked");
    setThumbsDownActive(message.user_sentiment === "disliked");
  }, [message.user_sentiment]);

  const handleRequestConnection = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDoc(null);
    }, 3000);
  };


  // Function to handle copy click
  const handleCopy = () => {
    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const handeleSources = () => {
    setShowSources(!showSources);
  };
  return (
    <div className={`p-4 `}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
          {isAI && (
            <img
              src={Logo}
              alt="Robot"
              className={`w-12 h-12 rounded-full p-2 outline-1 mt-1 mr-4 outline outline-gray-200 hidden sm:block`}
            />
          )}

          <div
            className={`max-w-[80%] ${
              isAI ? "" : "bg-[#F6F6F6]  py-2 px-4 "
            } rounded-lg break-words`}
          >
            <ReactMarkdown remarkPlugins={remarkGfm}>
              {message.content}
            </ReactMarkdown>
            {isAI && (
              <div className="flex mt-2 items-center">
                {/* Thumbs Up Icon */}
               

                {/* Copy Icon */}
                <button
                  className="relative inline-block ml-2 cursor-pointer group"
                  onClick={handleCopy}
                >
                  <Copy className="w-5 h-5 inline-block text-gray-600 hover:text-blue-500" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Copy
                  </span>
                </button>

               
              </div>
            )}
          </div>
          {!isAI && (
            <img
              src={userInfo?.profile_picture}
              alt={userInfo?.name}
              className={`w-10 h-10 rounded-full ml-4 outline-1 mt-1 mr-4 outline outline-gray-200 hidden sm:block`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
