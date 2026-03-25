const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @description     Create or fetch One to One Chat
// @route           POST /api/chat/
// @access          Protected
const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    try {
        let isChat = await Conversation.find({
            isGroupChat: false,
            $and: [
                { users: { $all: [req.user._id, userId] } },
                { users: { $size: 2 } }
            ]
        })
            .populate("users", "-password -emailOTP -emailOTPExpires")
            .populate("latestMessage");

        // If it's a self-chat, we need to be even more specific because $all:[A,A] is just $all:[A]
        if (req.user._id.toString() === userId.toString()) {
            isChat = isChat.filter(c => 
                c.users.length === 2 &&
                c.users[0]._id.toString() === req.user._id.toString() && 
                c.users[1]._id.toString() === req.user._id.toString()
            );
        }

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name profileImage email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Conversation.create(chatData);
            const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Fetch all chats for a user
// @route           GET /api/chat/
// @access          Protected
const fetchChats = async (req, res) => {
    try {
        // --- Auto-Batch Group Logic ---
        if (req.user && req.user.graduationYear) {
            const batchName = `Class of ${req.user.graduationYear}`;
            let batchGroup = await Conversation.findOne({ isGroupChat: true, chatName: batchName }).select('_id users');
            
            if (!batchGroup) {
                // Find some admin or just use the current user as the initial creator
                await Conversation.create({
                    chatName: batchName,
                    isGroupChat: true,
                    users: [req.user._id],
                    groupAdmin: req.user._id
                });
            } else if (!batchGroup.users.includes(req.user._id)) {
                // Ensure user is in the group
                await Conversation.findByIdAndUpdate(batchGroup._id, { $push: { users: req.user._id } });
            }
        }
        // --- End Auto-Batch Group Logic ---

        let results = await Conversation.find({ users: req.user._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name profileImage email",
        });
        res.status(200).send(results);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Create New Group Chat
// @route           POST /api/chat/group
// @access          Protected
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user._id);

    try {
        const groupChat = await Conversation.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Rename Group
// @route           PUT /api/chat/rename
// @access          Protected
const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;
    
    let chat = await Conversation.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    
    if (chat.groupAdmin && chat.groupAdmin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Only group admin can rename" });
    }

    const updatedChat = await Conversation.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(updatedChat);
    }
};

// @description     Remove user from Group
// @route           PUT /api/chat/groupremove
// @access          Protected
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const chat = await Conversation.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const isRequesterAdmin = chat.groupAdmin && chat.groupAdmin.toString() === req.user._id.toString();
    const isSelfRemove = userId === req.user._id.toString();

    if (!isRequesterAdmin && !isSelfRemove) {
        return res.status(403).json({ message: "Only group admin can remove other members" });
    }

    // Remove user
    const removed = await Conversation.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(removed);
    }
};

// @description     Add user to Group / Leave
// @route           PUT /api/chat/groupadd
// @access          Protected
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const chat = await Conversation.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    
    const isSelfAddition = userId === req.user._id.toString();
    const isRequesterAdmin = chat.groupAdmin && chat.groupAdmin.toString() === req.user._id.toString();

    if (!isRequesterAdmin && !isSelfAddition) {
        return res.status(403).json({ message: "Only group admin can add other members" });
    }

    // Add user
    const added = await Conversation.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(added);
    }
};

// @description     Fetch all Batch Groups (Class of XXXX)
// @route           GET /api/chat/batches
// @access          Protected
const getBatchGroups = async (req, res) => {
    try {
        const batches = await Conversation.find({ 
            isGroupChat: true, 
            chatName: { $regex: /^Class of / } 
        })
        .populate("users", "name profileImage")
        .sort({ chatName: -1 });
        
        res.status(200).json(batches);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    getBatchGroups,
};
