import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import App from './App';
import * as serviceWorker from './serviceWorker';

const firebaseConfig = {
    projectId: 'bitprobe-mw',
    messagingSenderId: '681880625516',
    appId: '1:681880625516:web:2b22ba74c125fdb7',
    apiKey: 'AIzaSyAnbO6YxUtBd24w3utkVG4C4d9lrX4OZbM',
    authDomain: 'bitprobe-mw.firebaseapp.com',
    databaseURL: 'https://bitprobe-mw.firebaseio.com',
    storageBucket: 'bitprobe-mw.appspot.com'
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
