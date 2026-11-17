const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');

// @description     Get all Messages
// @route           GET /api/message/:chatId
// @access          Protected
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profileImage email");
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Create New Message
// @route           POST /api/message/
// @access          Protected
const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name profileImage email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name profileImage email",
        });

        await Conversation.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Report Message
// @route           POST /api/message/report
// @access          Protected
const reportMessage = async (req, res) => {
    try {
        const { messageId, reason } = req.body;
        if (!messageId || !reason) {
            return res.status(400).json({ message: "Invalid data passed into request" });
        }
        const report = await Report.create({
            reporter: req.user._id,
            reportedMessage: messageId,
            reason: reason,
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Edit Message
// @route           PUT /api/message/:id
// @access          Protected
const editMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const messageId = req.params.id;
        console.log("Editing message ID:", messageId, "New content:", content);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log("Message not found with ID:", messageId);
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.sender.toString() !== req.user._id.toString()) {
            console.log("Not authorized to edit. Sender:", message.sender, "User:", req.user._id);
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        let updatedMessage = await Message.findById(messageId)
            .populate("sender", "name profileImage email")
            .populate("chat");

        res.json(updatedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Delete Message
// @route           DELETE /api/message/:id
// @access          Protected
const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        if (message.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized to delete this message" });

        message.content = "This message was deleted";
        message.isDeleted = true;
        await message.save();

        let deletedMessage = await Message.findById(messageId)
            .populate("sender", "name profileImage email")
            .populate("chat");

        res.json(deletedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @description     Upload File Attachment
// @route           POST /api/message/attachment
// @access          Protected
const sendAttachment = async (req, res) => {
    try {
        const { chatId, content } = req.body;
        if (!chatId) return res.status(400).json({ message: "Invalid chat data" });
        if (!req.file) return res.status(400).json({ message: "No file provided" });

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'alumni_connect/messages', resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        var newMessage = {
            sender: req.user._id,
            content: content || "",
            chat: chatId,
            fileUrl: result.secure_url,
            fileType: result.resource_type
        };

        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name profileImage email");
        message = await message.populate("chat");
        message = await User.populate(message, { path: "chat.users", select: "name profileImage email" });
        
        await Conversation.findByIdAndUpdate(chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @description     Mark Messages as Read
// @route           PUT /api/message/read/:chatId
// @access          Protected
const markAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { chat: req.params.chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { allMessages, sendMessage, reportMessage, editMessage, deleteMessage, sendAttachment, markAsRead };
