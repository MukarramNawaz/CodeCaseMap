import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LOGO from "../../assets/logo_single.png";
import {
  Send,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import SparklesImg from "../../assets/sparkles.png";
import { useTranslation } from "react-i18next";
const ChatInput = forwardRef(
  (
    {
      message,
      setMessage,
      setIsInputFocused,
      messagesLength,
      onSubmit,
      suggestions,
      onSuggestionClick,
      isLoading,
      isSidebarOpen,
      sidebarWidth,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const textAreaRef = useRef(null);
    const starterMenuRef = useRef(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [showStarterMenu, setShowStarterMenu] = useState(false);

    // Predefined starter messages
    const starterMessages = [
      "Tell me about divorce proceedings",
      "How do I file for child custody?",
      "What are my legal rights in a separation?",
      "How to prepare for a court hearing?",
      "What documents do I need for my case?",
    ];

    // Handle selecting a starter message
    const handleStarterSelect = (message) => {
      setMessage(message);
      setShowStarterMenu(false);
      textAreaRef.current?.focus();
    };

    // Handle clicking outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          starterMenuRef.current &&
          !starterMenuRef.current.contains(event.target)
        ) {
          setShowStarterMenu(false);
        }
      };

      // Add event listener when dropdown is open
      if (showStarterMenu) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      // Cleanup event listener
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showStarterMenu]);
    useEffect(() => {
      if (textAreaRef.current) {
        const textarea = textAreaRef.current;
        textarea.style.height = "auto"; // Reset height to auto so it can shrink
        textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on scrollHeight

        // Limiting to 3 rows (adjust height if greater than 3 rows)
        if (textarea.scrollHeight >= 72) {
          textarea.style.height = "76px"; // max height for 3 rows (around 24px per row)
        }
      }
    }, [message]);

    return (
      <motion.div
        initial={{ marginLeft: 0 }}
        animate={{
          marginLeft:
            isSidebarOpen && window.innerWidth >= 768
              ? `${sidebarWidth}px`
              : "0px",
        }}
        transition={{ duration: 0.5 }}
        className={`fixed left-0 right-0 pb-2 transition-transform duration-300 ${
          messagesLength > 0 ? "bottom-6" : "bottom-6"
        } z-20`}
      >
        <div className="w-full max-w-5xl mx-auto lg:px-0 px-4">
          {messagesLength == 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div
                className="bg-white shadow-xl p-5 mx-auto rounded-full mb-8 w-24 h-24 flex items-center justify-center"
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <img src={LOGO} alt="Robot" className="object-contain" />
              </div>
              <h1 className="text-4xl font-bold mb-8">
                {t("chatinput.helpPrompt")}
              </h1>
            </motion.div>
          )}

          {/* <form onSubmit={onSubmit} className="relative mb-4 ">
            <textarea
              ref={ref}
              rows={isInputFocused && message.length >0 ? 3 : 1}
              className="w-full p-4 pr-24 rounded-3xl border focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white shadow-lg"
              placeholder="Send a messsage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                if (!message.trim()) {
                  setIsInputFocused(false);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-2  bottom-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form> */}

          {/* Starter Button - always visible */}
          {/* <div className="relative mb-4 flex items-center">
            <div
              ref={starterMenuRef}
              className="relative z-30 flex items-center"
            > */}
          {/* Dropdown container with ref */}

          {/* <img
                src={SparklesImg}
                alt="Sparkles"
                className="h-10 w-10 mr-4"
              />
              <button
                type="button"
                onClick={() => setShowStarterMenu(!showStarterMenu)}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-gray-700 font-medium">Starter</span> */}
          {/* Display both icons */}
          {/* <div className="flex flex-col items-center">
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </button> */}
          {/* Starter Menu Dropdown */}
          {/* {showStarterMenu && (
                <div className="absolute bottom-full left-0 right-0 transform w-64 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-100 overflow-hidden">
                  {" "} */}
          {/* Increased width and z-index */}
          {/* <div className="max-h-60 overflow-y-auto py-2">
                    {starterMessages.map((msg, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => handleStarterSelect(msg)}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div> */}

          {/* Chat Input */}
          <form onSubmit={onSubmit} className="relative mb-4">
            <textarea
              ref={textAreaRef}
              rows={1}
              className="relative w-full py-5 pl-4 pr-24 rounded-xl border focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white shadow-lg no-scrollbar"
              placeholder={t("chatinput.sendMessage")}
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                if (!message.trim()) {
                  setIsInputFocused(false);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-4 bottom-4 px-6 py-2 rounded-3xl text-white bg-tertiary"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send
                  className={`h-7 w-7 ${
                    isLoading || !message.trim() ? "opacity-50" : ""
                  } `}
                />
              )}
            </button>
          </form>
          {/* Disclaimer - only shown when user has exactly 1 message */}
          {messagesLength > 0 && (
            <div className="text-center text-sm text-gray-600 mt-2">
              CASEMAP COACH can make mistakes. See our{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                privacy policy
              </a>{" "}
              &{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                terms of use
              </a>
            </div>
          )}
          {/* {messagesLength == 0 && (
            <div className=" flex justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-5 py-3 bg-white text-primary/60 font-medium flex gap-2 text-lg rounded-full shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <suggestion.icon className={`${suggestion.style}`}/>{suggestion.label}
                  </button>
                ))}
              </div>)} */}

          {messagesLength == 0 && (
            <div className="flex flex-col sm:flex-row justify-center gap-2 flex-wrap">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-4 py-3 bg-white text-primary/60 font-medium flex gap-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <img
                    src={suggestion.icon}
                    alt={suggestion.iconAlt}
                    className="w-5 h-5 sm:block"
                  />
                  <span className="truncate">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}

          {messagesLength == 0 && showDisclaimer && (
            <div className="mt-8 p-4 rounded-lg bg-[#DEFFC9] relative hidden md:block">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full"
                aria-label="Close disclaimer"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 font-bold mb-2">
                <AlertTriangle size={20} />
                <h3 className="text-md font-semibold leading-6">
                  Important Notice
                </h3>
              </div>
              <p className="text-md text-gray-500 font-semibold leading-6">
                This GPT is designed for informational and educational purposes
                only and does not constitute legal advice or create an
                attorney-client relationship. Although it may provide insights
                based on legal concepts, it is not a substitute for consultation
                with a qualified attorney licensed to practice in your
                jurisdiction. By using this GPT, you acknowledge and agree that
                any actions taken based on its output are your sole
                responsibility. The developer and owner of this GPT disclaim any
                liability for outcomes resulting from its use. For legal advice
                specific to your situation, consult a licensed attorney.
              </p>
              <p className="text-md text-gray-500 font-semibold leading-6 mt-2">
                See our{" "}
                <a href="#" className="underline text-blue-600">
                  Privacy Policy
                </a>{" "}
                &{" "}
                <a href="#" className="underline text-blue-600">
                  Terms of Use
                </a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
