import React, { useState, useEffect, useRef } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { MessageCircleMore, X } from "lucide-react";
import { useTranslation } from "react-i18next";
const ChatItem = ({ chat, onRename, currentThreadId, onDelete, onChatClick }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chat.name);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const ref = useRef(null);
  useEffect(() => {
    // Function to handle clicks outside the ref
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handelDeletePopup = () => {
    onDelete(chat.id);
    setIsDeleteOpen(false);
  };
  return (
    <div
      className={`py-2 px-3 rounded-lg relative group transition-all duration-200 ${
        currentThreadId === chat.id 
          ? "bg-tertiary bg-opacity-10 border-l-4 border-tertiary shadow-sm" 
          : "hover:bg-gray-100 border-l-4 border-transparent"
      }`}
    >
      {!isEditing ? (
        <div className="flex justify-between items-center">
          <div
            className="flex gap-2 items-center cursor-pointer w-full"
            onClick={() => onChatClick(chat)}
          >
            <MessageCircleMore className={`h-5 w-5 ${currentThreadId === chat.id ? "text-tertiary" : ""}`} />
            <span className={`${currentThreadId === chat.id ? "font-medium text-tertiary" : ""}`}>
              {chat.name.slice(0, 18)} {chat.name.length > 18 && "..."}
            </span>
          </div>

          <Menu as="div" className="relative">
            <MenuButton className="p-1 rounded-lg hover:bg-gray-200">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-primary ring-opacity-5 focus:outline-none z-10">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100" : ""
                    } group flex w-full items-center px-4 py-2 text-sm`}
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="mr-3 h-5 w-5 text-gray-400" />
                    {t("chatitem.rename")}
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100" : ""
                    } group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-red-400" />
                    {t("chatitem.delete")}
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      ) : (
        <div ref={ref} className="flex items-center w-full">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded px-2 w-[80%] flex-1"
          />
          <button
            className="ml-2 text-sm text-green-500 hover:text-green-700"
            onClick={() => {
              onRename(chat.id, newName);
              setIsEditing(false);
            }}
          >
            <CheckIcon className="h-5 w-5 text-gray-500 " />
          </button>
        </div>
      )}
      {isDeleteOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-11/12 md:max-w-md md:w-full p-6 rounded-lg shadow-lg ">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("chatitem.deleteChatConfirmation")}
              </h2>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className=" text-gray-700 px-10 py-2 rounded-3xl hover:bg-gray-400 focus:outline-none border border-gray-400"
              >
                {t("chatitem.cancel")}
              </button>
              <button
                className="bg-red-600 text-white px-10 py-2 rounded-3xl hover:bg-red-800 focus:outline-none"
                onClick={handelDeletePopup}
              >
                {t("chatitem.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatItem;