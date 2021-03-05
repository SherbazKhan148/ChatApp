import {
    MESSAGE_CREATE_FAILED,
    MESSAGE_CREATE_REQUEST,
    MESSAGE_CREATE_RESET,
    MESSAGE_CREATE_SUCCESS,
    MESSAGE_LIST_FAILED,
    MESSAGE_LIST_REQUEST,
    MESSAGE_LIST_RESET,
    MESSAGE_LIST_SUCCESS,
} from "../constants/messageConstants";

export const messageListReducer = (state = { messages: [] }, action) => {
    switch (action.type) {
        case MESSAGE_LIST_REQUEST:
            return { loading: true, messages: [] };
        case MESSAGE_LIST_SUCCESS:
            if (action.payload) {
                return {
                    loading: false,
                    messages: action.payload,
                    success: true,
                };
            } else if (action.pushedMessage) {
                let finalMessages = [...state.messages];
                finalMessages.push(action.pushedMessag);
                return {
                    messages: finalMessages,
                };
            } else {
                return;
            }
        case MESSAGE_LIST_FAILED:
            return {
                loading: false,
                error: action.payload,
            };
        case MESSAGE_LIST_RESET:
            return {};
        default:
            return state;
    }
};

export const messageCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case MESSAGE_CREATE_REQUEST:
            return { loading: true };
        case MESSAGE_CREATE_SUCCESS:
            return {
                loading: false,
                success: true,
                message: action.payload.msg,
            };
        case MESSAGE_CREATE_FAILED:
            return {
                loading: false,
                error: action.payload,
            };
        case MESSAGE_CREATE_RESET:
            return {
                loading: false,
                success: null,
                message: null,
                error: null,
            };
        default:
            return state;
    }
};
