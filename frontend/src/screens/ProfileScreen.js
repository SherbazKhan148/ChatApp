import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getUserDetails, updateUserProfile } from "../actions/userActions";
import { logout } from "../actions/userActions";

const ProfileScreen = ({ location, history }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);

    const dispatch = useDispatch();

    const userDetails = useSelector((state) => state.userDetails);
    const { loading, error, user } = userDetails;

    //For Redirecting to Home Page
    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
    const {
        loading: updateLoading,
        success: updateSuccess,
        error: updateError,
    } = userUpdateProfile;

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        } else {
            if (user) {
                if (!user.name) {
                    dispatch(getUserDetails("profile"));
                } else {
                    setName(user.name);
                    setEmail(user.email);
                }
            } else {
                if (error && error.includes("Token Failed")) {
                    dispatch(logout());
                }
            }
        }
    }, [dispatch, history, userInfo, user, error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords Not Match");
        } else {
            dispatch(
                updateUserProfile({ id: user._id, name, email, password })
            );
        }
    };

    return (
        <Row>
            <Col md={4}>
                <h2>User Profile</h2>
                {message && <Message variant="danger">{message}</Message>}
                {error && (
                    <Message variant="danger">
                        {error.includes("Token Failed")
                            ? "Your Session is Expired. Please Login Again"
                            : error}
                    </Message>
                )}
                {loading && <Loader />}
                {updateLoading && <Loader />}
                {updateError && (
                    <Message variant="danger">
                        {updateError.includes("Token Failed")
                            ? "Session Expired. Please Login Again"
                            : updateError}
                    </Message>
                )}
                {!updateLoading && updateSuccess && (
                    <Message variant="success">
                        User Updated Successfully
                    </Message>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="name"
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

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
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Button type="submit" variant="primary">
                        Update
                    </Button>
                </Form>
            </Col>
            <Col md={8}>
                <h2>My Posts</h2>
            </Col>
        </Row>
    );
};

export default ProfileScreen;
