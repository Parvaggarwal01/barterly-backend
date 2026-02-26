import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { getIO } from "../config/socket.js";

/**
 * Retrieve all active conversations for a user
 */
export const getUserConversations = async (userId) => {
  try {
    const filter = { participants: { $in: [userId] } };
    const conversations = await Conversation.find(filter)
      .populate("participants", "name avatar isActive")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return conversations;
  } catch (error) {
    throw new Error(`Error fetching conversations: ${error.message}`);
  }
};

/**
 * Get or create a conversation between current user and another participant
 */
export const getOrCreateConversation = async (userId, participantId, barterId) => {
  try {
    // Try to find an existing conversation containing both participants
    const existing = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    }).populate("participants", "name avatar isActive").populate("lastMessage");

    if (existing) {
      // If barterId is provided and different, we optionally could update it, but returning works for now
      return existing;
    }

    // Create a new conversation
    const newConversation = await Conversation.create({
      participants: [userId, participantId],
      barter: barterId || undefined,
    });

    return await Conversation.findById(newConversation._id)
      .populate("participants", "name avatar isActive");

  } catch (error) {
    throw new Error(`Error getting/creating conversation: ${error.message}`);
  }
};

/**
 * Get all messages for a specific conversation ID
 */
export const getMessages = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("You are not part of this conversation");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    return messages;
  } catch (error) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }
};

/**
 * Send a message and emit socket event directly
 */
export const sendMessage = async (conversationId, senderId, content, type = "text") => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(senderId)) {
       throw new Error("You are not part of this conversation");
    }

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
      type
    });

    // Populate sender details for the socket emit response
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name avatar");

    // Update conversation lastMessage hook and updatedAt cache
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Fire socket event for all clients in this conversation's room
    const io = getIO();
    io.to(conversationId).emit("new_message", populatedMessage);

    return populatedMessage;
  } catch (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }
};
