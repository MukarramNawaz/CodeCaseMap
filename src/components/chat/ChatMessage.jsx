import ReactMarkdown from "react-markdown";
import Logo from "../../assets/CaseMap_logo_small.png";
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
import rehypeRaw from "rehype-raw";
// import axios from 'axios';
function ChatMessage({ message, convId, isTyping }) {
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
              className={`w-12 h-12 rounded-full p-2 mt-1 mr-4 hidden sm:block shadow-lg shadow-tertiary/30 border border-gray-100`}
            />
          )}

          <div
            className={`max-w-[80%] ${
              isAI ? "" : "bg-tertiary  py-2 px-4 "
            } rounded-lg break-words`}
          >
            {/* <ReactMarkdown remarkPlugins={remarkGfm}>
              {message.content}
            </ReactMarkdown> */}

{isAI ? (
            isTyping ? (
              <div className="p-1">
                <div className="typing-animation">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-primary-700" {...props} />,
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold mt-4 mb-2 text-primary-600" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold mt-3 mb-1 text-primary-500" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="mb-2 text-gray-700" {...props} />,
                  ul: ({ node, ...props }) => <ul className="my-2 ml-4 list-disc text-gray-700" {...props} />,
                  ol: ({ node, ...props }) => <ol className="my-2 ml-4 list-decimal text-gray-700" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                  a: ({ node, ...props }) => <a className="text-primary-600 hover:underline" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary-200 pl-4 my-2 italic text-gray-600" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-primary-50 rounded px-1 text-primary-700" {...props} />
                    ) : (
                      <code className="block bg-primary-50 p-2 rounded text-primary-700" {...props} />
                    ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="px-4 py-2 bg-primary-50 text-left text-xs font-medium text-primary-700 uppercase tracking-wider"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )
          ) : (
            // User message with white text
            <div className="text-white">
              {message.content}
            </div>
          )}

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
