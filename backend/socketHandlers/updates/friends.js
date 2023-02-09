const User = require("../../models/user");
const FriendInvitation = require("../../models/friendInvitation");
const serverStore = require("../../serverStore");

// the user who was invited will have pending invitation
const updateFriendsPendingInvitations = async (userId) => {
  // one user can be online in multiple tab or platform so they will have different socket it but the userId will be same so we will update accoring to userId
  try {
    // here we are adding the extra information(email, username, _if) about invitation sender
    const pendingInvitations = await FriendInvitation.find({
      receiverId: userId, // this selects the data whose receiverId is same as userId and this collection also contains the senderId which we will use for populate
    }).populate("senderId", "_id username mail"); // we have User ref in senderId so this populate will look for that senderId(simply is _id in User table) in User table(which returns the entire data as object) and will add(populate) _id, username and email from that matched _id user to the friendInviation collection of that senderId collection(row in sql term)

    // find all active connections of specific userId
    const receiverList = serverStore.getActiveConnections(userId);

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("friends-invitations", {
        pendingInvitations: pendingInvitations ? pendingInvitations : [], // suppose if we delete the invitation(we delete the invitation if user either accepts or rejects the invitation) by deleting by id(see in postReject or accept controller) then the pendingInviations will be null as no data will be found for that userId so empty array will be send as a response
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateFriends = async (userId) => {
  try {
    // find active connections of specific id (online users)
    const receiverList = serverStore.getActiveConnections(userId);

    if (receiverList.length > 0) {
      // finds user with userId and selects _id and friends fields. Then in friends array adds _id, username and mail fields from matching userId. If second option is not passed in populate the entire object will be added. Here we want to exclude the password field
      const user = await User.findById(userId, { _id: 1, friends: 1 }).populate(
        "friends",
        "_id username mail"
      );

      if (user) {
        const friendsList = user.friends.map((f) => {
          return {
            id: f._id,
            mail: f.mail,
            username: f.username,
          };
        });

        // get io server instance
        const io = serverStore.getSocketServerInstance();

        receiverList.forEach((receiverSocketId) => {
          io.to(receiverSocketId).emit("friends-list", {
            friends: friendsList ? friendsList : [],
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  updateFriendsPendingInvitations,
  updateFriends,
};
