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
import Divorce from "../assets/divorce.png";
import Custody from "../assets/custody.png";
import Strategy from "../assets/strategy.png";
import Guide from "../assets/guide.png";
import CaseMapLogo from "../assets/CaseMap_logo_small.png";
import PremiumBadge from "../assets/premium badge.png";
import toast from "react-hot-toast";

import SubscriptionModal from "../components/subscription/SubscriptionModal";

import AccountSettings from "../components/settings/AccountSettings";
import ChatInput from "../components/chat/ChatInput";
import SearchModal from "../components/chat/SearchModal";
import ChatItem from "../components/chat/ChatItem";
import Logo from "../assets/CaseMap logo.png";
import QuestionMarkIcon from "../assets/question mark.png";
import BgCircles from "../assets/rounded circles.png";
import ChatHistory from "../assets/chathistory.png";
import {
  UserRoundPen,
  FilePen,
  Target,
  MessageSquarePlus,
  MessageSquareDot,
  UserIcon,
} from "lucide-react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import SideBarToggle from "../assets/SideBarToggle.svg";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../features/userSlice";
import ChatMessage from "../components/chat/ChatMessage";
import TypingAnimation from "../components/chat/TypingAnimation";
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
  streamAssistant,
} from "../services/api";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
function Chat() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [fetchingChats, setFetchingChats] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [daysRemaining, setDaysRemaining] = useState(7); // Default to 7 days for free trial
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
        throw new Error("Failed to fetch chats");
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

  useEffect(() => {
    // Calculate days remaining in trial if user is on Basic plan
    if (userInfo && !userInfo.hasActiveSubscription) {
      // If user has a created_at date, calculate days remaining
      if (userInfo.created_at) {
        const createdDate = new Date(userInfo.created_at);
        const currentDate = new Date();
        const trialPeriod = 7; // 7 days trial period
        
        // Calculate difference in days
        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate remaining days
        const remaining = Math.max(0, trialPeriod - diffDays);
        setDaysRemaining(remaining);
      }
    }
  }, [userInfo]);

  // Sort chats into categories based on their createdAt date
  const sortChatsByDate = (chats) => {
    if (!chats || !Array.isArray(chats) || chats.length === 0) {
      setChatHistory({
        today: [],
        yesterday: [],
        previousWeek: [],
        previousMonth: [],
      });
      return;
    }

    // Get current date at start of day (midnight) for consistent comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate reference dates (all at midnight)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // For previous week, we'll consider anything within the last 7 days
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    // For previous month, we'll consider anything from 7 days ago to 30 days ago
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    const sortedHistory = {
      today: [],
      yesterday: [],
      previousWeek: [],
      previousMonth: [],
    };

    chats.forEach((chat) => {
      // Parse the date and normalize to midnight for consistent comparison
      const chatDateTime = new Date(chat.created_at);
      const chatDate = new Date(
        chatDateTime.getFullYear(),
        chatDateTime.getMonth(),
        chatDateTime.getDate()
      );

      // Compare dates
      if (chatDate.getTime() === today.getTime()) {
        sortedHistory.today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        sortedHistory.yesterday.push(chat);
      } else if (chatDate >= oneWeekAgo && chatDate < yesterday) {
        sortedHistory.previousWeek.push(chat);
      } else if (chatDate >= oneMonthAgo && chatDate < oneWeekAgo) {
        sortedHistory.previousMonth.push(chat);
      } else if (chatDate < oneMonthAgo) {
        // Add to previousMonth for any older chats
        sortedHistory.previousMonth.push(chat);
      }
    });

    // Sort each category by date (newest first)
    Object.keys(sortedHistory).forEach((key) => {
      sortedHistory[key].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    });

    setChatHistory(sortedHistory);
  };

  const getChat = async (chat) => {
    if (currentThreadId === chat.id) return;
    try {
      const response = await getConversationById(chat.id);
      setCurrentThreadId(chat.id);

      // Check if the response is successful and has data
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        // Set empty array if no messages
        setMessages([]);
        console.error("No messages found for this chat");
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      toast.error("Failed to fetch chat");
      // Set empty array on error
      setMessages([]);
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
    setCurrentThreadId(null);
    // setIsSidebarOpen(false);
  };

  //-----------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep sidebar always open on desktop, but allow mobile users to toggle it
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //     try {
  //       const { data } = await createConversation(message);
  //       setChatHistory((prev) => ({
  //         ...prev,
  //         today: [data, ...prev.today],
  //       }));

  //       setCurrentThreadId(data.id);

  //       if (message.trim()) {
  //         const userMessage = message.trim();
  //         setMessage("");
  //         setMessages((prev) => [
  //           ...prev,
  //           { content: userMessage, role: "user" },
  //         ]);

  //         try {
  //           const response = await sendMessageToConversation(
  //             currentThreadId,
  //             message);

  //           const reader = response.body.getReader();
  //           const decoder = new TextDecoder();
  //           let assistantMessage = { content: "", role: "assistant" };

  //           while (true) {
  //             const { done, value } = await reader.read();
  //             if (done) break;

  //             const chunk = decoder.decode(value, { stream: true });
  //             const lines = chunk.split("\n");

  //             for (const line of lines) {
  //               if (line.trim() === "") continue;

  //               const parsedLine = JSON.parse(line);
  //               if (parsedLine.event === "delta") {
  //                 assistantMessage.content += parsedLine.data;
  //                 setMessages((prev) => {
  //                   const lastMessage = prev[prev.length - 1];
  //                   if (lastMessage.role === "assistant") {
  //                     return [
  //                       ...prev.slice(0, -1),
  //                       { ...lastMessage, content: assistantMessage.content },
  //                     ];
  //                   } else {
  //                     return [...prev, assistantMessage];
  //                   }
  //                 });
  //               } else if (parsedLine.event === "sources") {
  //                 // Update the assistant's message with the sources
  //                 assistantMessage.sources = parsedLine.data;
  //                 setMessages((prev) => {
  //                   const lastMessage = prev[prev.length - 1];
  //                   if (lastMessage.role === "assistant") {
  //                     return [
  //                       ...prev.slice(0, -1),
  //                       { ...lastMessage, sources: assistantMessage.sources },
  //                     ];
  //                   } else {
  //                     return [...prev, assistantMessage];
  //                   }
  //                 });
  //               } else if (parsedLine.event === "done") {
  //                 // Update the assistant's message with the sources
  //                 assistantMessage.id = parsedLine.message_id;
  //                 setMessages((prev) => {
  //                   const lastMessage = prev[prev.length - 1];
  //                   if (lastMessage.role === "assistant") {
  //                     return [
  //                       ...prev.slice(0, -1),
  //                       { ...lastMessage, id: assistantMessage.id },
  //                     ];
  //                   } else {
  //                     return [...prev, assistantMessage];
  //                   }
  //                 });
  //               }
  //             }
  //           }
  //         } catch (error) {
  //           toast.error("Failed to send message");
  //         } finally {
  //           setIsLoading(false);
  //         }
  //       }
  //       return;
  //     } catch (error) {
  //       toast.error("Failed to send message");
  //       setIsLoading(false);
  //       return;
  //     }
  //   }

  //   if (message.trim() && !isLoading) {
  //     const userMessage = message.trim();
  //     setMessage("");
  //     setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);

  //     try {
  //       const response = await fetch(
  //         `${API_BASE_URL}/user/conversation/${currentThreadId}/message/send`,
  //         {
  //           method: "POST",
  //           headers: {
  //             Accept: "application/json",
  //             "Content-Type": "application/json",
  //           },
  //           credentials: "include", // Equivalent to `withCredentials: true` in Axios
  //           body: JSON.stringify({ message, stream: true }),
  //         }
  //       );

  //       const reader = response.body.getReader();
  //       const decoder = new TextDecoder();
  //       let assistantMessage = { content: "", role: "assistant" };

  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break;

  //         const chunk = decoder.decode(value, { stream: true });
  //         const lines = chunk.split("\n");

  //         for (const line of lines) {
  //           if (line.trim() === "") continue;

  //           const parsedLine = JSON.parse(line);
  //           if (parsedLine.event === "delta") {
  //             assistantMessage.content += parsedLine.data;
  //             setMessages((prev) => {
  //               const lastMessage = prev[prev.length - 1];
  //               if (lastMessage.role === "assistant") {
  //                 return [
  //                   ...prev.slice(0, -1),
  //                   { ...lastMessage, content: assistantMessage.content },
  //                 ];
  //               } else {
  //                 return [...prev, assistantMessage];
  //               }
  //             });
  //           } else if (parsedLine.event === "sources") {
  //             // Update the assistant's message with the sources
  //             assistantMessage.sources = parsedLine.data;
  //             setMessages((prev) => {
  //               const lastMessage = prev[prev.length - 1];
  //               if (lastMessage.role === "assistant") {
  //                 return [
  //                   ...prev.slice(0, -1),
  //                   { ...lastMessage, sources: assistantMessage.sources },
  //                 ];
  //               } else {
  //                 return [...prev, assistantMessage];
  //               }
  //             });
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       toast.error("Failed to send message");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      // 1) Create thread if needed
      let threadId = currentThreadId;
      if (!threadId) {
        const { response } = await createConversation(text);
        threadId = response.data.id;
        setChatHistory((prev) => ({
          ...prev,
          today: [response.data, ...prev.today],
        }));
        setCurrentThreadId(threadId);
      }

      // 2) Append user message locally
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setMessage("");

      // 3) Persist user message in backend & OpenAI
      await sendMessageToConversation(threadId, text);

      // 4) Stream assistant response
      let buffer = "";
      // add empty assistant message with typing indicator
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isTyping: true },
      ]);

      streamAssistant(
        threadId,
        (chunk) => {
          buffer += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            // update last assistant message
            updated[updated.length - 1].content = buffer;
            updated[updated.length - 1].isTyping = false;
            return updated;
          });
        },
        () => {
          setIsLoading(false);
          setIsTyping(false);
        },
        (err) => {
          console.error("Stream error", err);
          setIsLoading(false);
          setIsTyping(false);
        }
      );
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // fetch(`http://localhost:3000/api/createassistant`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   credentials: "include",
    // })

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
      icon: Divorce,
      iconAlt: "Divorce",
      label: `${t("chat.suggestions.divorce")}`,
      style: "text-blue-400",
    },
    {
      icon: Custody,
      iconAlt: "Custody",
      label: `${t("chat.suggestions.custody")}`,
      style: "text-primary",
    },
    {
      icon: Strategy,
      iconAlt: "Strategy",
      label: `${t("chat.suggestions.strategy")}`,
      style: "text-red-400",
    },
    {
      icon: Guide,
      iconAlt: "Guide",
      label: `${t("chat.suggestions.guide")}`,
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
    <div className="flex-1 overflow-y-auto m-4 ">
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
            className="bg-white flex flex-col md:relative fixed top-0 left-0 bottom-0 z-50 md:z-20 "
          >
            <div>
              <div className="p-4 flex items-center justify-between">
                <img src={Logo} alt="CaseMap logo" className="w-24" />
                <div className="flex items-center">
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
                    onClick={() =>
                      window.innerWidth < 768 &&
                      setIsSidebarOpen(!isSidebarOpen)
                    }
                    className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group ml-2 md:hidden"
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

              {/* New Chat Button - Redesigned to match the image */}
              <div className="px-4 mb-4">
                <button
                  onClick={createNewChat}
                  className="w-full flex items-center justify-start gap-2 bg-white rounded-2xl px-5 py-3 hover:bg-gray-50 border border-gray-200 transition-all"
                  style={{
                    boxShadow:
                      "0 -4px 6px -1px rgba(15, 61, 74, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="bg-tertiary p-2 rounded-xl">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-tertiary">
                    New Chat
                  </span>
                </button>
              </div>

              {/* Chat History Header */}
              <div className="px-4 flex items-center mt-10">
                {/* <img
                  className="w-6 h-6 mr-2"
                  src={ChatHistory}
                  alt="Chat History"
                /> */}
                <MessageSquareDot className="h-6 w-6 mr-2 text-[#EFAE08]" />
                <h2 className="text-xl font-medium text-gray-500">
                  {t("chat.history")}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4  m-1">
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
                        currentThreadId={currentThreadId}
                        onDelete={handleDelete}
                        onRename={handleRename}
                        onChatClick={getChat}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            {!userInfo?.hasActiveSubscription && (
              <div className="p-4 relative">
                <div className="bg-tertiary p-4 h-48 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-10 inset-0 pointer-events-none">
                    <img
                      src={BgCircles}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <div className="bg-white w-10 h-10 rounded-2xl p-1 flex items-center justify-center">
                      <img src={QuestionMarkIcon} alt="" className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-lg font-semibold text-white">
                      {t("chat.latestversion")}
                    </h2>
                    <p className="text-sm text-white">
                      {t("chat.ClickTheButton")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="w-full p-2 bg-white rounded-full hover:bg-gray-100 border border-gray-150 relative z-10"
                  >
                    {t("chat.upgradePlan")}
                  </button>
                </div>
              </div>
            )}
            {/* <div
              className={`resize-handle ${isResizing ? "resizing" : ""}`}
              onMouseDown={startResizing}
              onClick={(e) => e.stopPropagation()}
            /> */}
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
              {/* <button
                onClick={createNewChat}
                className="relative p-1 hover:bg-gray-100 rounded-xl border border-gray-100 group ml-6"
                aria-label="New Chat"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 text-white" />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  New Chat
                </span>
              </button> */}

              <button
                onClick={() =>
                  window.innerWidth < 768 && setIsSidebarOpen(!isSidebarOpen)
                }
                className="relative p-1 hover:bg-gray-100 rounded-lg border border-gray-100 group md:hidden"
                aria-label="Hide Side Bar"
              >
                <img
                  src={SideBarToggle}
                  alt="Hide Side Bar"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                {/* <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Show Side Bar
                </span> */}
              </button>
              <img src={CaseMapLogo} alt="Logo" className="pl-2" />
            </>
            {/* )} */}
          </motion.div>

          {/* Trial Period Indicator */}
          {userInfo && !userInfo.hasActiveSubscription && daysRemaining > 0 && (
            <div className="mr-3">
              <div className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                <BoltIcon className="h-3.5 w-3.5 mr-1" />
                <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left</span>
              </div>
            </div>
          )}

          {/* Settings Menu */}
          <div className="flex items-center">
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center justify-center bg-gray-200 rounded-full p-2 mr-2">
                <Cog6ToothIcon className="h-6 w-6 text-tertiary " />
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

            {/* Profile Picture (no action) */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center relative">
                {userInfo?.profile_picture ? (
                  <img
                    src={userInfo.profile_picture}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                {userInfo?.hasActiveSubscription && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <img src={PremiumBadge} alt="Premium" className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area with Messages and Input */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50 rounded-tl-3xl rounded-brl-lg">
          {showSettingsModal ? (
            <AnimatePresence>
              <motion.div
                className="absolute top-16 bottom-0 left-0 right-0 z-10 bg-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <AccountSettings
                  onClose={() => {
                    setShowSettingsModal(false);
                    setSettingsDefaultTab(0);
                  }}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              {messages && messages.length > 0 && (
                <motion.div
                  initial={{ marginLeft: 0 }}
                  animate={{
                    marginLeft:
                      isSidebarOpen && window.innerWidth >= 768
                        ? `${sidebarWidth}px`
                        : "0px",
                  }}
                  transition={{ duration: 0.5 }}
                  className="pb-1 fixed bottom-48 top-16 right-0 left-0 px-4 max-h-[80vh] overflow-y-auto z-10 flex flex-col-reverse"
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
                          convId={currentThreadId}
                          isTyping={msg.isTyping}
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
                messagesLength={messages ? messages.length : 0}
                setIsInputFocused={setIsInputFocused}
                onSubmit={handleSendMessage}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
              />
            </>
          )}
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
    </div>
  );
}

export default Chat;
