//src/routes/user.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMyFriends, getRecommendedUsers , sendFriendRequest , acceptFriendRequest , getFriendRequests , getOutgoingFriendReqs ,addFavorite , removeFavorite } from "../controllers/user.controller.js";

const router = express.Router();

//apply auth middleware to all routes
router.use(protectRoute);
router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests",getFriendRequests)
router.get("/outgoing-friend-requests",getOutgoingFriendReqs)

// favorites
router.post("/friends/:id/favorite", addFavorite);
router.delete("/friends/:id/favorite", removeFavorite);

export default router;