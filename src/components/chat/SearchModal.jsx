import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { XMarkIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

function SearchModal({ isOpen, onClose, onSelect, allChats }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);

  // Update filtered chats whenever search term or allChats changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(allChats);
      return;
    }

    const searchResults = allChats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(searchResults);
  }, [searchTerm, allChats]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-primary bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search chat history..."
                    className="w-full p-4 pr-12 text-lg focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto p-4">
                  {filteredChats.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No chats found
                    </p>
                  ) : (
                    filteredChats.map((chat, index) => (
                      <button
                        key={chat.id}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 rounded-lg text-left"
                        onClick={() => {
                          onSelect(chat);
                          onClose();
                        }}
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                        <span>{chat.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SearchModal;