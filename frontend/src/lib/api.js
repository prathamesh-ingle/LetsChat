// src/lib/api.js
import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("Error in getAuthUser", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users"); // ✅ add await
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get(
    "/users/outgoing-friend-requests"
  );
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(
    `/users/friend-request/${userId}`
  );
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

/* ------- favorites APIs ------- */
export async function addFavoriteFriend(friendId) {
  const response = await axiosInstance.post(
    `/users/friends/${friendId}/favorite`
  );
  return response.data;
}

export async function removeFavoriteFriend(friendId) {
  const response = await axiosInstance.delete(
    `/users/friends/${friendId}/favorite`
  );
  return response.data;
}

/* ------- NEW CALL APIs (for 1-to-1 calls) ------- */
export async function initiateCall(recipientId, type = "video") {
  const response = await axiosInstance.post("/call/initiate", {
    recipientId,
    type
  });
  return response.data;
}

export async function acceptCall(callId) {
  const response = await axiosInstance.post(`/call/accept/${callId}`);
  return response.data;
}

export async function rejectCall(callId) {
  const response = await axiosInstance.post(`/call/reject/${callId}`);
  return response.data;
}

export async function endCall(callId) {
  const response = await axiosInstance.post(`/call/end/${callId}`);
  return response.data;
}

export async function getCallHistory() {
  const response = await axiosInstance.get("/call/history");
  return response.data;
}
