//src/controllers/user.controller.js
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const friendIds = Array.isArray(req.user.friends) ? req.user.friends : [];

    const recommendedUsers = await User.find({
      _id: { $nin: [currentUserId, ...friendIds] }, // exclude self + friends
      isOnboarded: true,
    }).select("fullName profilePic nativeLanguage learningLanguage bio location");

    return res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}



export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends favorites")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage bio");

    const favoritesSet = new Set(user.favorites.map((id) => id.toString()));

    const friendsWithFavorite = user.friends.map((friend) => ({
      ...friend.toObject(),
      isFavorite: favoritesSet.has(friend._id.toString()),
    }));

    res.status(200).json(friendsWithFavorite);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params;

        //prevent sending request to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        //check if the recipient has already sent a friend request to the user
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        //check if a req already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [{ sender: myId, recipient: recipientId },
            { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this user" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);

    } catch (error) {
        console.log("Error in sendFriendRequest controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req,res){
    try {
        const {id:requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({message:"Friend request not found"});
        }

        // Verify the current user is the recipient
        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message: "You are not authorized to accept this friend request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        //add each user to the other`s friend array
        // $addToSet: adds element to an array if it doesn't already exist

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });
        res.status(200).json({message:"Friend request accepted"});
    } catch (error) {
        console.log("Error in acceptFriendRequest controller",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}

export async function getFriendRequests(req,res){
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage");
    
        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient","fullName profilePic");
        res.status(200).json({incomingReqs, acceptedReqs});

    } catch (error) {
       console.log("Error in getPendingFriendRequests controller",error.message);
       res.status(500).json({message: "Internal Server Error"}) 
    }
}

export async function getOutgoingFriendReqs(req,res){
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(outgoingRequests);

    } catch (error) {
        console.log("Error in getOutgoingFriendRequests controller",error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { id: friendId } = req.params;

    // must be a friend first (optional but recommended)
    const me = await User.findById(userId).select("friends favorites");
    if (!me) return res.status(404).json({ message: "User not found" });

    const isFriend = me.friends.some((f) => f.toString() === friendId);
    if (!isFriend) {
      return res.status(400).json({ message: "You can only favorite your friends" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: friendId },
    });

    return res.status(200).json({ success: true, message: "Added to favorites" });
  } catch (error) {
    console.log("Error in addFavorite controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { id: friendId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: friendId },
    });

    return res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.log("Error in removeFavorite controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
