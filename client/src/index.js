import AppRouter from './routes/router/AppRouter';
import ReactDOM from 'react-dom';
import React from 'react';
import './styles/index.css';

//App root element
const root = document.getElementById('app');

//Main App
const MainApp = (
    <div className="page-inner">
        <AppRouter />
    </div>
)

ReactDOM.render(
    MainApp,
    root
);

export default MainApp