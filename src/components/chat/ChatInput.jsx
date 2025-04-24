import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LOGO from "../../assets/CaseMap logo.png";
import { Send, AlertTriangle, X } from "lucide-react";
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
    const [showDisclaimer, setShowDisclaimer] = useState(true);
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
          messagesLength > 0 ? "bottom-6" : "translate-y-36"
        }`}
      >
        <div className="w-full max-w-5xl mx-auto lg:px-0 px-4">
          {messagesLength == 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <img
                src={LOGO}
                alt="Robot"
                className="w-24 mx-auto rounded-full mb-8"
              />
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
              {/* {isLoading ? "Sending..." : "Send"} */}
              <Send
                className={`h-7 w-7 ${
                  isLoading || !message.trim() ? "opacity-50" : ""
                } `}
              />
            </button>
          </form>
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
                  <suggestion.icon className={`${suggestion.style} sm:block`} />
                  <span className="truncate">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}

          {messagesLength == 0 && showDisclaimer && (
            <div className="mt-8 p-4 rounded-lg bg-[#DEFFC9] relative">
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
              <p className="text-md text-gray-600 font-semibold leading-6">
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
              <p className="text-md text-gray-600 font-semibold leading-6 mt-2">
                See our{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>{" "}
                &{" "}
                <a href="#" className="underline">
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