import * as chatService from "../services/chat.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";

/**
 * Get current user's available conversations
 * @route GET /api/chat/conversations
 * @access Private
 */
export const getMyConversations = async (req, res) => {
  try {
    const result = await chatService.getUserConversations(req.user.id);
    return successResponse(res, 200, "Conversations retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

/**
 * Create or get conversation with a specific user
 * @route POST /api/chat/conversations
 * @access Private
 */
export const createConversation = async (req, res) => {
  try {
    const { participantId, barterId } = req.body;
    if (!participantId) {
       return errorResponse(res, 400, "participantId is required");
    }
    const result = await chatService.getOrCreateConversation(req.user.id, participantId, barterId);
    return successResponse(res, 201, "Conversation retrieved/created successfully", result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

/**
 * Get conversation messages by ID
 * @route GET /api/chat/conversations/:id
 * @access Private
 */
export const getConversationById = async (req, res) => {
  try {
    const result = await chatService.getMessages(req.params.id, req.user.id);
    return successResponse(res, 200, "Messages retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

/**
 * Send message to conversation
 * @route POST /api/chat/conversations/:id/messages
 * @access Private
 */
export const sendMessage = async (req, res) => {
  try {
    const result = await chatService.sendMessage(
        req.params.id, 
        req.user.id, 
        req.body.content, 
        req.body.type || "text"
    );
    return successResponse(res, 201, "Message sent successfully", result);
  } catch (error) {
    console.log("SendMessage Error Trace:", error);
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};
