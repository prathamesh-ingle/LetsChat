// src/components/Sidebar.jsx
import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  MessageCircleMore,
  UsersIcon,
  UserPlusIcon,
  Filter,
  Star,
  Bot,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import {
  getUserFriends,
  addFavoriteFriend,
  removeFavoriteFriend,
} from "../lib/api";

const Sidebar = ({ isOpenMobile = false, onCloseMobile = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const location = useLocation();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const {
    data: friends = [],
    isLoading: isFriendsLoading,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: addFavMutate } = useMutation({
    mutationFn: addFavoriteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: removeFavMutate } = useMutation({
    mutationFn: removeFavoriteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const handleToggleFavorite = (id, isFavorite) => {
    if (isFavorite) {
      removeFavMutate(id);
    } else {
      addFavMutate(id);
    }
  };

  // Enrich & cap list for performance
  const enrichedFriends = useMemo(
    () =>
      friends.slice(0, 50).map((friend, index) => ({
        type: "friend",
        id: friend._id,
        name: friend.fullName || `User ${index + 1}`,
        avatar:
          friend.profilePic ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend._id}`,
        unread: Math.floor(Math.random() * 8),
        online: Math.random() > 0.6,
        lastMessage: friend.bio
          ? friend.bio.length > 42
            ? friend.bio.slice(0, 39) + "..."
            : friend.bio
          : "Say hi and start practicing!",
        time: ["09:15", "Yesterday", "Sun", "Mon"][
          Math.floor(Math.random() * 4)
        ],
        isFavorite: !!friend.isFavorite,
      })),
    [friends]
  );

  const allItems = enrichedFriends;

  const filteredItems = useMemo(() => {
    if (activeFilter === "unread") {
      return allItems.filter((f) => f.unread > 0);
    }
    if (activeFilter === "favorites") {
      return allItems.filter((f) => f.isFavorite);
    }
    return allItems;
  }, [activeFilter, allItems]);

  const searchResults = useMemo(
    () =>
      friends.filter(
        (friend) =>
          friend.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.nativeLanguage
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.learningLanguage
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [friends, searchQuery]
  );

  const handleSearchFocus = () => setShowSearchResults(true);
  const handleSearchBlur = () =>
    setTimeout(() => setShowSearchResults(false), 180);

  const isLoading = isFriendsLoading;

  const sidebarClasses = [
    "flex flex-col h-screen",
    "bg-gradient-to-b from-base-200 via-base-200/80 to-base-100",
    "border-r border-base-300/80",
    "shadow-[0_0_40px_rgba(0,0,0,0.18)]",
    "w-64 lg:w-72 xl:w-80",
    "transition-transform duration-300 ease-in-out",
    "z-40",
    "overflow-hidden",
    "lg:static lg:translate-x-0 lg:flex",
    isOpenMobile
      ? "fixed left-0 top-0 translate-x-0"
      : "fixed left-0 top-0 -translate-x-full",
  ].join(" ");

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* HEADER / BRAND */}
        <div className="h-16 lg:h-18 px-3 lg:px-4 border-b border-base-300/70 bg-base-200/80 backdrop-blur-md flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 px-2 py-1 rounded-2xl hover:bg-base-300/70 transition-colors"
            onClick={onCloseMobile}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/40">
              <MessageCircleMore className="size-4 text-base-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base lg:text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide">
                LetsChat
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link
              to="/friends"
              className="btn btn-ghost btn-xs rounded-full px-2.5 sm:px-3 gap-1 hover:bg-base-300/80"
              onClick={onCloseMobile}
            >
              <UsersIcon className="size-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                Friends
              </span>
            </Link>

            <Link
              to="/notifications"
              className="btn btn-ghost btn-xs rounded-full px-2.5 sm:px-3 gap-1 hover:bg-base-300/80 whitespace-nowrap"
              onClick={onCloseMobile}
            >
              <UserPlusIcon className="size-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                Requests
              </span>
            </Link>
          </div>
        </div>

        {/* DISCOVERY: SEARCH + FILTERS */}
        <div className="px-3 pt-2 pb-1 border-b border-base-300/70 bg-base-200/70 relative">
          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50 size-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats or languages"
              className="input input-bordered w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-2xl bg-base-100/90 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/40 border-base-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
          </div>

          {showSearchResults && searchQuery && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-[5.5rem] lg:top-[5.8rem] z-40 bg-base-200/95 border border-base-300 rounded-2xl shadow-2xl max-h-72 sm:max-h-80 overflow-y-auto backdrop-blur-md">
              <div className="px-4 py-2 border-b border-base-300/80 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                  Friends ({searchResults.length})
                </p>
                <span className="text-[10px] text-base-content/60">
                  Tap to open chat
                </span>
              </div>
              <div className="divide-y divide-base-300/70">
                {searchResults.slice(0, 10).map((friend) => (
                  <Link
                    key={friend._id}
                    to={`/chat/${friend._id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-base-300/80 transition-colors"
                    onClick={onCloseMobile}
                  >
                    <div className="avatar flex-shrink-0">
                      <div className="w-9 sm:w-10 rounded-full ring-1 ring-base-300/70 overflow-hidden">
                        <img
                          src={
                            friend.profilePic ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend._id}`
                          }
                          alt={friend.fullName}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {friend.fullName}
                      </p>
                      <p className="text-[11px] text-base-content/60 truncate">
                        {friend.nativeLanguage} · {friend.learningLanguage}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-1 flex items-center justify-between">
            <div className="inline-flex bg-base-100/80 rounded-full p-0.5 border border-base-300/70 text-[11px] font-medium">
              {["all", "unread", "favorites"].map((key) => {
                const label =
                  key === "all"
                    ? "All"
                    : key === "unread"
                    ? "Unread"
                    : "Favorites";
                const isActive = activeFilter === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={[
                      "px-2.5 sm:px-3 py-1 rounded-full transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-content shadow-sm shadow-primary/40"
                        : "text-base-content/70 hover:bg-base-200",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-base-content/60">
              {enrichedFriends.filter((f) => f.unread > 0).length} unread
            </span>
          </div>
        </div>

        {/* ACTIVITY: FRIENDS / CHATS LIST */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-base-400 scrollbar-track-base-200 px-1.5 sm:px-2 py-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-18 rounded-2xl bg-base-300/70 animate-pulse flex items-center gap-3 px-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-base-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-base-200" />
                    <div className="h-3 w-1/2 rounded bg-base-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 text-center text-base-content/40">
              <UsersIcon className="size-16 sm:size-20 mb-3 sm:mb-4 opacity-40" />
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                No chats yet
              </h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                Send a few friend requests to start chatting.
              </p>
              <Link
                to="/notifications"
                className="btn btn-primary btn-xs sm:btn-sm gap-2"
                onClick={onCloseMobile}
              >
                <UserPlusIcon className="size-4" />
                View requests
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center text-base-content/40 px-4">
              <h3 className="text-sm font-semibold mb-1">
                Nothing in this filter
              </h3>
              <p className="text-xs">
                Try switching to All or start a new conversation.
              </p>
            </div>
          ) : (
            <>
              <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
                Recent chats
              </p>

              {filteredItems.map((item) => {
                const active = location.pathname === `/chat/${item.id}`;
                const isFavorite = item.isFavorite;

                return (
                  <div
                    key={item.id}
                    className={[
                      "group flex gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-2xl items-center transition-all duration-150 cursor-pointer",
                      "hover:bg-base-300/80 hover:shadow-md hover:-translate-y-0.5",
                      active
                        ? "bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/15 border border-primary/40 shadow-lg shadow-primary/30"
                        : "bg-base-100/80 border border-base-300/40",
                    ].join(" ")}
                  >
                    <Link
                      to={`/chat/${item.id}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                      onClick={onCloseMobile}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary/60 shadow-sm transition-all">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {item.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success ring-2 ring-base-100" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p
                              className={[
                                "text-sm truncate",
                                item.unread > 0
                                  ? "font-semibold text-base-content"
                                  : "font-medium text-base-content",
                              ].join(" ")}
                            >
                              {item.name}
                            </p>
                            {isFavorite && (
                              <span className="text-[9px] px-1 py-0.5 rounded-full bg-warning/15 text-warning font-semibold uppercase tracking-wide">
                                Fav
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-base-content/55 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                        <p
                          className={[
                            "mt-0.5 text-[11px] truncate",
                            item.unread > 0
                              ? "text-primary font-medium"
                              : "text-base-content/70",
                          ].join(" ")}
                        >
                          {item.lastMessage}
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleFavorite(item.id, isFavorite)
                      }
                      className="p-1 rounded-full hover:bg-base-300/80 flex-shrink-0 transition-colors"
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Star
                        className={`size-4 ${
                          isFavorite
                            ? "fill-warning text-warning"
                            : "text-base-content/40"
                        }`}
                      />
                    </button>

                    {item.unread > 0 && (
                      <div className="flex flex-col items-end justify-center gap-1 ml-1 flex-shrink-0">
                        <span className="badge badge-primary badge-sm font-semibold text-[10px]">
                          {item.unread > 99 ? "99+" : item.unread}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* AI ENTRY POINT */}
        <div className="px-3 pt-1 pb-1 flex items-center justify-end">
          <Link
            to="/ai-chat"
            onClick={onCloseMobile}
            className="group inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1.5
                     bg-gradient-to-tr from-primary via-secondary to-primary
                     shadow-md shadow-primary/40 border border-base-100/80
                     text-[11px] text-base-100 font-medium
                     transition-all duration-200 ease-out
                     hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-base-100/10">
              <Bot className="w-3.5 h-3.5 text-base-100" />
            </span>
            <span className="hidden sm:inline">AI Assistant</span>
          </Link>
        </div>

        {/* FOOTER / USER */}
        <div className="px-3 pb-3 pt-2 border-t border-base-300/70 bg-base-200/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="avatar">
                <div className="w-8 sm:w-9 rounded-full ring-2 ring-success/70 overflow-hidden">
                  <img
                    src={
                      authUser?.profilePic ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?._id}`
                    }
                    alt={authUser?.fullName || "User Avatar"}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {authUser?.fullName || "User"}
                </p>
                <p className="text-[11px] text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Online
                </p>
              </div>
            </div>

            <div className="hidden xl:flex text-[10px] text-base-content/60 flex-col items-end">
              <span className="uppercase tracking-wide font-semibold">
                Secure chat
              </span>
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
