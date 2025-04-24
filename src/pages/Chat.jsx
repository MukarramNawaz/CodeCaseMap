import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Description,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import SubscriptionModal from "../components/subscription/SubscriptionModal";

import SettingsModal from "../components/settings/SettingsModal";
import ChatInput from "../components/chat/ChatInput";
import SearchModal from "../components/chat/SearchModal";
import ChatItem from "../components/chat/ChatItem";
import Logo from "../assets/CaseMap logo.png";

import { UserRoundPen, FilePen, Target } from "lucide-react";
import NewChatToggle from "../assets/NewChatToggle.svg";
import SideBarToggle from "../assets/SideBarToggle.svg";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../features/userSlice";
import ChatMessage from "../components/chat/ChatMessage";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  logoutUser,
  getAllConversations,
  getConversationById,
  deleteConversationById,
  sendMessageToConversation,
  updateConversationById,
  createConversation,
} from "../services/api";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
function Chat() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [fetchingChats, setFetchingChats] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [chatHistory, setChatHistory] = useState({
    today: [],
    yesterday: [],
    previousWeek: [],
    previousMonth: [],
  });
  const [sidebarWidth, setSidebarWidth] = useState(288); // 72px * 4
  const [isResizing, setIsResizing] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState(0);

  const sidebarRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  //-----------------------------------------------------------------------------

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing) {
        const newWidth = Math.max(280, Math.min(600, e.clientX));
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "";
    document.body.classList.remove("resizing");
  }, [handleMouseMove]);

  const startResizing = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "ew-resize";
      document.body.classList.add("resizing");
    },
    [handleMouseMove, stopResizing]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.classList.remove("resizing");
    };
  }, [handleMouseMove, stopResizing]);

  //-----------------------------------------------------------------------------

  // Fetch chats from the API
  const fetchChats = async () => {
    setFetchingChats(true);
    try {
      const response = await getAllConversations();
      if (response.success && response.data) {
        sortChatsByDate(response.data);
        setAllChats(response.data);
      } else {
        throw new Error('Failed to fetch chats');
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setFetchingChats(false);
    }
  };
  useEffect(() => {
    fetchChats();
  }, []);

  // Sort chats into categories based on their createdAt date
  const sortChatsByDate = (chats) => {
    const today = new Date();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(today.getDate() - 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const sortedHistory = {
      today: [],
      yesterday: [],
      previousWeek: [],
      previousMonth: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.created_at);

      if (chatDate.toDateString() === today.toDateString()) {
        sortedHistory.today.push(chat);
      } else if (chatDate.toDateString() === oneDayAgo.toDateString()) {
        sortedHistory.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        sortedHistory.previousWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        sortedHistory.previousMonth.push(chat);
      }
    });

    setChatHistory(sortedHistory);
  };

  const getChat = async (chat) => {
    if (currentChatId === chat.id) return;
    try {
      const data = await getConversationById(chat.id);
      setCurrentChatId(chat.id);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching chat:", error);
      toast.error("Failed to fetch chat");
    }
  };

  // Delete chat API
  const handleDelete = async (id) => {
    try {
      await deleteConversationById(id);

      setChatHistory((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, chats]) => [
            key,
            chats.filter((chat) => chat.id !== id),
          ])
        )
      );
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error("Error deleting chat:", error);
    }
  };

  // Rename chat API
  const handleRename = async (id, newName) => {
    try {
      const response = await updateConversationById(id, newName);

      if (!response.success) {
        toast.error("Couldn't rename the chat, please try again.");
        return;
      }
      setChatHistory((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, chats]) => [
            key,
            chats.map((chat) =>
              chat.id === id ? { ...chat, name: newName } : chat
            ),
          ])
        )
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const createNewChat = async () => {
    setMessage("");
    setMessages([]);
    setCurrentChatId(null);
    // setIsSidebarOpen(false);
  };

  //-----------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentChatId && message.trim()) {
      setIsLoading(true);

      try {
        const { data } = await createConversation(message);
        setChatHistory((prev) => ({
          ...prev,
          today: [data, ...prev.today],
        }));

        setCurrentChatId(data.id);

        if (message.trim()) {
          const userMessage = message.trim();
          setMessage("");
          setMessages((prev) => [
            ...prev,
            { content: userMessage, role: "user" },
          ]);

          try {
            const response = await fetch(
              `${API_BASE_URL}/user/conversation/${data.id}/message/send`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                credentials: "include", // Equivalent to `withCredentials: true` in Axios
                body: JSON.stringify({ message, stream: true }),
              }
            );

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { content: "", role: "assistant" };

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.trim() === "") continue;

                const parsedLine = JSON.parse(line);
                if (parsedLine.event === "delta") {
                  assistantMessage.content += parsedLine.data;
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: assistantMessage.content },
                      ];
                    } else {
                      return [...prev, assistantMessage];
                    }
                  });
                } else if (parsedLine.event === "sources") {
                  // Update the assistant's message with the sources
                  assistantMessage.sources = parsedLine.data;
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, sources: assistantMessage.sources },
                      ];
                    } else {
                      return [...prev, assistantMessage];
                    }
                  });
                } else if (parsedLine.event === "done") {
                  // Update the assistant's message with the sources
                  assistantMessage.id = parsedLine.message_id;
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, id: assistantMessage.id },
                      ];
                    } else {
                      return [...prev, assistantMessage];
                    }
                  });
                }
              }
            }
          } catch (error) {
            toast.error("Failed to send message");
          } finally {
            setIsLoading(false);
          }
        }
        return;
      } catch (error) {
        toast.error("Failed to send message");
        setIsLoading(false);
        return;
      }
    }

    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      setMessage("");
      setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);

      try {
        const response = await fetch(
          `${API_BASE_URL}/user/conversation/${currentChatId}/message/send`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include", // Equivalent to `withCredentials: true` in Axios
            body: JSON.stringify({ message, stream: true }),
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = { content: "", role: "assistant" };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.trim() === "") continue;

            const parsedLine = JSON.parse(line);
            if (parsedLine.event === "delta") {
              assistantMessage.content += parsedLine.data;
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: assistantMessage.content },
                  ];
                } else {
                  return [...prev, assistantMessage];
                }
              });
            } else if (parsedLine.event === "sources") {
              // Update the assistant's message with the sources
              assistantMessage.sources = parsedLine.data;
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, sources: assistantMessage.sources },
                  ];
                } else {
                  return [...prev, assistantMessage];
                }
              });
            }
          }
        }
      } catch (error) {
        toast.error("Failed to send message");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.label);
    inputRef.current?.focus();
  };

  //-----------------------------------------------------------------------------

  const handleLogout = async () => {
    const logoutResponse = await logoutUser();
    if (logoutResponse.success !== true) {
      toast.error(logoutResponse.error);
      return;
    }

    navigate("/login");
  };
  //-----------------------------------------------------------------------------
 

  //-----------------------------------------------------------------------------

  const suggestions = [
    {
      icon: UserRoundPen,
      label: `${t("chat.updateEmployeeDetails")}`,
      style: "text-blue-400",
    },
    {
      icon: FilePen,
      label: `${t("chat.generateVerificationLetter")}`,
      style: "text-black",
    },
    {
      icon: Target,
      label: `${t("chat.trackEmployeeGoals")}`,
      style: "text-red-400",
    },
  ];

  const menuItems = [
    {
      icon: UserCircleIcon,
      label: `${t("chat.profile")}`,
      onClick: () => {
        setSettingsDefaultTab(1);
        setShowSettingsModal(true);
      },
    },
    {
      icon: Cog6ToothIcon,
      label: `${t("chat.settings")}`,
      onClick: () => setShowSettingsModal(true),
    },
    {
      icon: CreditCardIcon,
      label: `${t("chat.upgradePlan")}`,
      onClick: () => setShowSubscriptionModal(true),
    },
    {
      icon: QuestionMarkCircleIcon,
      label: `${t("chat.help")}`,
      onClick: () => toast.success("Help section coming soon!"),
    },
    {
      icon: ArrowRightOnRectangleIcon,
      label: `${t("chat.logout")}`,
      onClick: () => {
        handleLogout();
      },
      className: "text-red-600",
    },
  ];
  //-----------------------------------------------------------------------------

  const ShimmerLoader = () => (
    <div className="flex-1 overflow-y-auto  rounded-lg m-4 bg-gray-50">
      <div className="mb-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mb-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mb-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mb-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Sidebar */}

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            // initial={{ x: -300 }}
            // animate={{ x: 0 }}
            // exit={{ x: -300 }}
            // transition={{ duration: 0.3 }}
            // className={`bg-white border-r flex flex-col  md:z-10 z-20  md:relative md:w-72 w-[70vw] absolute top-0 left-0 bottom-0`
            ref={sidebarRef}
            initial={{ x: -sidebarWidth }}
            animate={{ x: 0 }}
            exit={{ x: -sidebarWidth }}
            transition={{ duration: 0.5 }}
            style={{ width: sidebarWidth }}
            className="bg-white border-r flex flex-col md:relative fixed top-0 left-0 bottom-0 z-20"
          >
            <div>
              <div className="p-4 flex items-center justify-between">
                <img src={Logo} alt="CaseMap logo " className="w-32" />
                <div>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Search Chat
                    </span>
                  </button>
                  <button
                    onClick={createNewChat}
                    className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group ml-2"
                  >
                    <img
                      src={NewChatToggle}
                      alt="Hide Side Bar"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                    />
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      New Chat
                    </span>
                  </button>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group ml-2"
                    aria-label="Hide Side Bar"
                  >
                    <img
                      src={SideBarToggle}
                      alt="Hide Side Bar"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                    />
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Hide Side Bar
                    </span>
                  </button>
                </div>
              </div>
              <h1 className="text-3xl font-semibold p-4">
                {" "}
                {t("chat.history")}
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 border border-1 border-gray-150 rounded-lg m-4 bg-gray-50">
              {fetchingChats ? (
                <ShimmerLoader />
              ) : (
                Object.entries(chatHistory).map(([period, chats]) => (
                  <div key={period} className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 capitalize">
                      {chats.length > 0 ? period : ""}
                    </h2>
                    {chats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        currentChatId={currentChatId}
                        onDelete={handleDelete}
                        onRename={handleRename}
                        onChatClick={getChat}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="p-4">
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full p-2 bg-white rounded-lg hover:bg-gray-100 border border-gray-150"
              >
                <div>
                  <div className="flex flex-row items-center space-x-2">
                    <div className="border border-1 border-gray-300 rounded-full p-1">
                      <BoltIcon className="h-7 w-7 " />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-left">
                        {" "}
                        {t("chat.upgradePlan")}
                      </h3>
                      <p className="text-xs text-gray-500 ">
                        {t("chat.moreAccess")}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <div
              className={`resize-handle ${isResizing ? "resizing" : ""}`}
              onMouseDown={startResizing}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center sm:justify-end justify-between px-6">
          {isSidebarOpen && <p className={``}> </p>}
          <motion.div
            initial={{ marginLeft: 0 }}
            animate={{
              marginLeft:
                isSidebarOpen && window.innerWidth >= 768
                  ? `${sidebarWidth}px`
                  : "0px",
            }}
            transition={{ duration: 0.5 }}
            className={`flex items-center sm:fixed left-0 ${
              isSidebarOpen && "hidden"
            }  space-x-4 ml-4`}
          >
            {/* {!isSidebarOpen && ( */}
            <>
              <button
                onClick={createNewChat}
                className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group ml-6"
                aria-label="New Chat"
              >
                <img
                  src={NewChatToggle}
                  alt="New Chat"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  New Chat
                </span>
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group"
                aria-label="Hide Side Bar"
              >
                <img
                  src={SideBarToggle}
                  alt="Hide Side Bar"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Show Side Bar
                </span>
              </button>
              <img
                src={Logo}
                alt="Logo"
                className="pl-2 sm:pl-6 w-28 sm:w-40"
              />
            </>
            {/* )} */}
          </motion.div>

          {/* Profile Menu */}
          <Menu as="div" className="relative">
            {" "}
            <MenuButton className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2">
              {/* <div className="w-8 h-8 bg-gray-200 rounded-full" /> */}
              <img
                src={userInfo.profile_picture}
                alt="CaseMap User PFP"
                className="w-8 h-8 rounded-full"
              />
              <ChevronUpIcon className="h-4 w-4" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-2 z-30">
              {menuItems.map((item, index) => (
                <MenuItem key={index}>
                  {({ active }) => (
                    <button
                      onClick={item.onClick}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        item.className || ""
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>

        {/* Chat Area with Messages and Input */}
        <div className="flex-1  overflow-y-auto relative">
          {messages.length > 1 && (
            <motion.div
              initial={{ marginLeft: 0 }}
              animate={{
                marginLeft:
                  isSidebarOpen && window.innerWidth >= 768
                    ? `${sidebarWidth}px`
                    : "0px",
              }}
              transition={{ duration: 0.5 }}
              className="pb-1 fixed bottom-32 top-16 right-0 left-0 px-4 max-h-[80vh] overflow-y-auto z-10 flex flex-col-reverse"
            >
              {/* Padding to prevent messages being hidden behind input */}
              <div ref={messagesEndRef} />
              <div className="flex flex-col-reverse">
                {messages
                  .slice()
                  .reverse()
                  .map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg}
                      convId={currentChatId}
                    />
                  ))}
              </div>
            </motion.div>
          )}

          <ChatInput
            isSidebarOpen={isSidebarOpen}
            sidebarWidth={sidebarWidth}
            ref={inputRef}
            message={message}
            setMessage={setMessage}
            messagesLength={messages.length}
            setIsInputFocused={setIsInputFocused}
            onSubmit={handleSendMessage}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearchModal}
        allChats={allChats}
        onClose={() => setShowSearchModal(false)}
        onSelect={getChat}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
     
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSettingsDefaultTab(0);
        }}
        defaultTab={settingsDefaultTab}
      />

  
    </div>
  );
}

export default Chat;
