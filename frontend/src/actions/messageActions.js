import axios from "axios";
import {
    MESSAGE_CREATE_FAILED,
    MESSAGE_CREATE_REQUEST,
    MESSAGE_CREATE_SUCCESS,
    MESSAGE_LIST_FAILED,
    MESSAGE_LIST_REQUEST,
    MESSAGE_LIST_SUCCESS,
} from "../constants/messageConstants";

export const listMessages = () => async (dispatch, getState) => {
    try {
        dispatch({ type: MESSAGE_LIST_REQUEST });

        const {
            userLogin: { userInfo },
        } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const res = await axios.get(`/api/messages`, config);

        dispatch({ type: MESSAGE_LIST_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({
            type: MESSAGE_LIST_FAILED,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};

export const createMessage = (postData) => async (dispatch, getState) => {
    try {
        dispatch({ type: MESSAGE_CREATE_REQUEST });

        const {
            userLogin: { userInfo },
        } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.post(`/api/messages`, postData, config);

        dispatch({ type: MESSAGE_CREATE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: MESSAGE_CREATE_FAILED,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};
