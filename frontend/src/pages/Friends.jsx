// src/pages/Friends.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  UserPlusIcon,
  UsersIcon,
  SearchIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
    }
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    const s = search.toLowerCase();
    return friends.filter((f) => `${f.fullName}`.toLowerCase().includes(s));
  }, [friends, search]);

  const filteredRecommended = useMemo(() => {
    if (!search.trim()) return recommendedUsers;
    const s = search.toLowerCase();
    return recommendedUsers.filter((u) =>
      `${u.fullName}`.toLowerCase().includes(s)
    );
  }, [recommendedUsers, search]);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-8 sm:space-y-10">
        {/* Top header */}
        <header className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 sm:top-2.5 h-4 w-4 text-base-content/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search friends or people..."
                  className="input input-bordered w-full pl-9 text-xs sm:text-sm rounded-full bg-base-200/80 focus:bg-base-100"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Friends section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UsersIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Your Friends
                </h2>
                <p className="text-[11px] sm:text-xs text-base-content/60">
                  {friends.length} connection{friends.length !== 1 && "s"} ·
                  Stay in touch regularly.
                </p>
              </div>
            </div>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-10 sm:py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended users / Discover */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                Discover New People
              </h2>
              <p className="text-[11px] sm:text-xs text-base-content/60 max-w-xl">
                Suggestions based on language and interests — similar to
                Instagram and LinkedIn recommendations.
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-10 sm:py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : filteredRecommended.length === 0 ? (
            <div className="card bg-base-200/90 border border-dashed border-base-300 p-5 sm:p-6 text-center rounded-2xl">
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredRecommended.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-4">
                      {/* USER INFO */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="avatar size-12">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                        <h3 className="font-semibold truncate">
                          {user.fullName}
                        </h3>
                      </div>

                      {/* LANGUAGES */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="badge badge-secondary text-xs">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline text-xs">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {/* CONNECT BUTTON */}
                      <button
                        className={`btn btn-sm w-full text-xs ${
                          hasRequestBeenSent
                            ? "btn-outline border-success/60 text-success"
                            : "btn-primary"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-1.5" />
                            Requested
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-1.5" />
                            Connect
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FriendsPage;
