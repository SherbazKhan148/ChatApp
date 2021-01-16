import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import Paginate from "../components/Paginate";
import { Link } from "react-router-dom";

const HomeScreen = ({ match, history }) => {
    const dispatch = useDispatch();

    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        }
    }, [userInfo, history]);

    return (
        <>
            <h1>Welcome {userInfo?.name}</h1>
        </>
    );
};

export default HomeScreen;
