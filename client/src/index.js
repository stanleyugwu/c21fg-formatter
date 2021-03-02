import AppRouter from './routes/router/AppRouter';
import ReactDOM from 'react-dom';
import React, {useEffect} from 'react';
import './styles/index.css';

//App root element
const root = document.getElementById('app');
const loader = document.getElementById('loader');

//handle drag enter
function dragEnter(e){
    e.preventDefault();
}

//Main App
const MainApp = () => {

    //clear loader
    useEffect(()=>{
        loader.style.display = 'none';
    }, []);

    return (
        <div className="page-inner" onDragEnter={dragEnter}>
            <AppRouter />
        </div>
    )
}

ReactDOM.render(
    <MainApp/>,
    root
);

export default MainApp