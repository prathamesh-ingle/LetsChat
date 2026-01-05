// src/components/Navbar.jsx
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  LogOutIcon,
  PenSquare,
  ChevronDown,
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation } = useLogout();

  const isChatPage = location.pathname?.startsWith("/chat");
  const isNotificationsPage = location.pathname === "/notifications";
  const isFriendsPage = location.pathname === "/friends";

  const getPageTitle = () => {
    if (isChatPage) return "Chats";
    if (isNotificationsPage) return "Notifications";
    if (isFriendsPage) return "Friends";
    return "Home";
  };

  return (
    <nav className="bg-base-200/90 border-b border-base-300 sticky top-0 z-50 h-16 flex items-center backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.18)]">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* LEFT: mobile toggle + page title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile-only animated sidebar toggle (more compact, rounded-pill) */}
            <button
              className="lg:hidden relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-base-100 to-base-200 border border-base-300/80 shadow-sm hover:shadow-md hover:from-base-100 hover:to-base-100 transition-all duration-200 group"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <span
                className={[
                  "absolute h-0.5 w-4 rounded-full bg-base-content/85 transition-all duration-300",
                  isSidebarOpen
                    ? "rotate-45 translate-y-0"
                    : "-translate-y-1.5 group-hover:-translate-y-2",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute h-0.5 w-4 rounded-full bg-base-content/85 transition-all duration-300",
                  isSidebarOpen ? "opacity-0" : "opacity-100 group-hover:w-3.5",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute h-0.5 w-4 rounded-full bg-base-content/85 transition-all duration-300",
                  isSidebarOpen
                    ? "-rotate-45 translate-y-0"
                    : "translate-y-1.5 group-hover:translate-y-2",
                ].join(" ")}
              />
              <span className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover:ring-primary/20 transition-all" />
            </button>

            {/* Page title + tiny status chips */}
            <div className="sm:ml-1 flex flex-col">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold leading-tight truncate">
                  {getPageTitle()}
                </p>
                {isChatPage && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold uppercase tracking-wide">
                    Secure
                  </span>
                )}
                {isNotificationsPage && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-semibold uppercase tracking-wide">
                    Alerts
                  </span>
                )}
                {isFriendsPage && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold uppercase tracking-wide">
                    Social
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] text-base-content/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Active now
                </span>
                <span className="hidden sm:inline-block text-[10px] text-base-content/50">
                  {isChatPage
                    ? "Keep the streak going"
                    : isFriendsPage
                    ? "Find new partners"
                    : "Jump back into your chats"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: actions (unchanged) */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {isChatPage && (
              <Link to="/friends">
                <button
                  className="btn btn-ghost btn-circle hidden sm:flex tooltip tooltip-bottom"
                  data-tip="New chat"
                >
                  <PenSquare className="w-5 h-5 text-primary" />
                </button>
              </Link>
            )}

            <Link to="/notifications">
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-5 w-5 text-base-content opacity-85" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>
            </Link>

            <div className="hidden sm:flex">
              <ThemeSelector />
            </div>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-full hover:bg-base-300/80 transition-colors border border-base-300/70"
              >
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full ring-2 ring-primary/70 overflow-hidden">
                    <img
                      src={
                        authUser?.profilePic ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?._id}`
                      }
                      alt="User Avatar"
                    />
                  </div>
                </div>
                <div className="hidden md:flex flex-col mr-0.5 max-w-[130px]">
                  <span className="text-xs font-semibold truncate">
                    {authUser?.fullName || "User"}
                  </span>
                  <span className="text-[10px] text-base-content/60 truncate">
                    {authUser?.email || "Logged in"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-base-content/60 hidden md:block" />
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 p-2 shadow-xl bg-base-200/95 rounded-xl w-52 border border-base-300/80 backdrop-blur-md"
              >
                <li className="mb-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-100/80">
                    <div className="avatar">
                      <div className="w-9 h-9 rounded-full ring-2 ring-primary/50 overflow-hidden">
                        <img
                          src={
                            authUser?.profilePic ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?._id}`
                          }
                          alt="User Avatar"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {authUser?.fullName || "User"}
                      </p>
                      <p className="text-[10px] text-base-content/60 truncate">
                        {authUser?.email || "Profile"}
                      </p>
                    </div>
                  </div>
                </li>
                <li>
                  <Link to="/friends" className="text-xs">
                    Friends
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" className="text-xs">
                    Notifications
                  </Link>
                </li>
                <li className="mt-1 border-t border-base-300 pt-1">
                  <button
                    onClick={logoutMutation}
                    className="flex items-center justify-between text-xs text-error"
                  >
                    <span>Logout</span>
                    <LogOutIcon className="w-4 h-4" />
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex sm:hidden">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
