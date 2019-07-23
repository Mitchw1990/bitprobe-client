import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import uppy from './uppy';
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

function App() {


    useEffect(() => {
        uppy()
    })

    return (
        <div className="App">
            <header className="App-header">
                <form className="DashboardContainer">
                    <button className="UppyModalOpenerBtn">
                        Upload
                    </button>
                </form>
            </header>
        </div>
    );
}

export default App;
