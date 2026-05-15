"use strict";
// Shared message types for client and server
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChatMessage = isChatMessage;
exports.isAcceptUuidMessage = isAcceptUuidMessage;
exports.isDemotePlayer2Message = isDemotePlayer2Message;
exports.isSetGameMessage = isSetGameMessage;
exports.isSetPlayerCardMessage = isSetPlayerCardMessage;
exports.isJoinRoomMessage = isJoinRoomMessage;
exports.isRequestUuidMessage = isRequestUuidMessage;
exports.validateMessagePayload = validateMessagePayload;
function isChatMessage(obj) {
    return (obj &&
        obj.type === "chatMessage" &&
        typeof obj.roomKey === "string" &&
        typeof obj.messageContents === "object" &&
        obj.messageContents !== null &&
        typeof obj.messageContents.sender === "string" &&
        typeof obj.messageContents.chatText === "string" &&
        typeof obj.messageContents.timestamp === "number");
}
function isAcceptUuidMessage(obj) {
    return obj && obj.type === "acceptUuid";
}
function isDemotePlayer2Message(obj) {
    return (obj &&
        obj.type === "demotePlayer2" &&
        typeof obj.roomKey === "string");
}
function isSetGameMessage(obj) {
    return (obj &&
        obj.type === "setGame" &&
        typeof obj.roomKey === "string" &&
        typeof obj.columnsObject === "object" &&
        obj.columnsObject !== null &&
        Array.isArray(obj.allKeys) &&
        typeof obj.gameKey !== "undefined");
}
function isSetPlayerCardMessage(obj) {
    return (obj &&
        obj.type === "setPlayerCard" &&
        typeof obj.roomKey === "string" &&
        typeof obj.card !== "undefined");
}
function isJoinRoomMessage(obj) {
    return (obj &&
        obj.type === "joinRoom" &&
        typeof obj.roomKey === "string" &&
        typeof obj.username === "string");
}
function isRequestUuidMessage(obj) {
    return obj && obj.type === "requestUuid";
}
// --- Extracted message payload validation ---
function validateMessagePayload(message, bytes) {
    switch (message.type) {
        case "acceptUuid":
            if (!isAcceptUuidMessage(message)) {
                throw new Error("Invalid acceptUuid message. Message: " + bytes.toString());
            }
            break;
        case "chatMessage":
            if (!isChatMessage(message)) {
                throw new Error("Invalid or missing messageContents for chatMessage. Message: " + bytes.toString());
            }
            break;
        case "demotePlayer2":
            if (!isDemotePlayer2Message(message)) {
                throw new Error("Missing or invalid roomKey for demotePlayer2. Message: " + bytes.toString());
            }
            break;
        case "setGame":
            if (!isSetGameMessage(message)) {
                throw new Error("Missing or invalid fields for setGame. Message: " + bytes.toString());
            }
            break;
        case "setPlayerCard":
            if (!isSetPlayerCardMessage(message)) {
                throw new Error("Missing or invalid fields for setPlayerCard. Message: " + bytes.toString());
            }
            break;
        case "joinRoom":
            if (!isJoinRoomMessage(message)) {
                throw new Error("Missing or invalid fields for joinRoom. Message: " + bytes.toString());
            }
            break;
        case "requestUuid":
            if (!isRequestUuidMessage(message)) {
                throw new Error("Missing or invalid fields for requestUuid. Message: " + bytes.toString());
            }
            break;
        default:
            throw new Error("Unknown message type. Message: " + bytes.toString());
    }
}
