import { forwardRef, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LOGO from "../../assets/CaseMap logo.png";
import { Send } from "lucide-react";
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
              className="w-full py-5 pl-4 pr-24 rounded-3xl border focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white shadow-lg no-scrollbar"
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
              className="absolute right-4 bottom-6 text-black "
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
                    className="px-5 py-3 bg-white text-black/60 font-medium flex gap-2 text-lg rounded-full shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200"
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
                  className="px-4 py-3 bg-white text-black/60 font-medium flex gap-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <suggestion.icon className={`${suggestion.style} sm:block`} />
                  <span className="truncate">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
