import Header from '../../components/Header.js';
import Footer from '../../components/Footer.js';
import App from '../App';
import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";

const AppRouter = () => (
    <BrowserRouter>
        <Header/>
            <div className="inner-container">
                <Switch>
                    <Route component={App} path="/" exact={true} />
                    <Route component={App} path="" exact={false} />
                </Switch>
            </div>
        <Footer/>
    </BrowserRouter>
);

export default AppRouter