import React from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import UsersListScreen from "./screens/UsersListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import HomeScreen from "./screens/HomeScreen";

const App = () => {
    return (
        <Router>
            <Header />
            <main className="py-3">
                <Container>
                    <Route path="/login" component={LoginScreen} />
                    <Route path="/register" component={RegisterScreen} />
                    <Route path="/profile" component={ProfileScreen} />

                    <Route path="/admin/userlist" component={UsersListScreen} />
                    <Route
                        path="/admin/user/:id/edit"
                        component={UserEditScreen}
                    />

                    {/* SEARCH ON HOME PAGE */}
                    <Route
                        path="/search/:keyword"
                        component={HomeScreen}
                        exact
                    />

                    {/* SEARCH WITH PAGE NUMBER ON HOME PAGE */}
                    <Route
                        path="/search/:keyword/page/:pageNumber"
                        component={HomeScreen}
                        exact
                    />

                    {/* PAGE NUMBER ON HOME PAGE */}
                    <Route path="/page/:pageNumber" component={HomeScreen} />

                    {/* LAST */}
                    <Route path="/" component={HomeScreen} exact />
                </Container>
            </main>
            <Footer />
        </Router>
    );
};

export default App;
