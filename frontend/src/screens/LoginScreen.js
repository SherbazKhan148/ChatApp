import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { login, googleLogin } from "../actions/userActions";
import FromContainer from "../components/FromContainer";
import axios from "axios";
import GoogleLogin from "react-google-login";

const LoginScreen = ({ location, history }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [googleClientId, setGoogleClientId] = useState(null);

    const dispatch = useDispatch();

    const userLogin = useSelector((state) => state.userLogin);
    const { loading, error, userInfo } = userLogin;

    const redirect = location.search ? location.search.split("=")[1] : "/";

    const getGoogleClientId = async () => {
        try {
            const { data } = await axios.get("/api/config/googleClientId");

            if (data) {
                if (!googleClientId) {
                    setGoogleClientId(data);
                }
            } else {
                alert("Problem in getting Google ClientId");
            }
        } catch (err) {
            alert(
                "Error in getting Google ClientId \n" +
                    err.response.data.message
            );
        }
    };

    useEffect(() => {
        if (userInfo) {
            history.push(redirect);
        } else {
            if (!googleClientId) {
                getGoogleClientId();
            }
        }
        // eslint-disable-next-line
    }, [history, userInfo, redirect, googleClientId]);

    const handleGoogleSuccess = async (res) => {
        const { tokenId } = res;
        console.log("idToken " + tokenId);

        dispatch(googleLogin(tokenId));
    };

    const handleGoogleFailure = async (res) => {
        alert(JSON.stringify(res));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(login(email, password));
    };

    return (
        <FromContainer>
            <h1>Sign In</h1>
            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>Password Address</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Button type="submit" variant="primary">
                    Sign In
                </Button>{" "}
                {googleClientId && (
                    <GoogleLogin
                        clientId={googleClientId}
                        buttonText="Login"
                        onSuccess={handleGoogleSuccess}
                        onFailure={handleGoogleFailure}
                        cookiePolicy={"single_host_origin"}
                        render={(renderProps) => (
                            <button
                                onClick={renderProps.onClick}
                                className="loginBtn loginBtn--google"
                                style={{ cursor: "pointer" }}
                            >
                                Login With Google
                            </button>
                        )}
                    />
                )}
            </Form>

            <Row className="py-3">
                <Col>
                    <span>
                        Don't Have an Account?{" "}
                        <Link
                            to={
                                redirect !== "/"
                                    ? `/register?redirect=${redirect}`
                                    : "/register"
                            }
                        >
                            <u>Register</u>
                        </Link>
                    </span>
                </Col>
            </Row>
        </FromContainer>
    );
};

export default LoginScreen;
