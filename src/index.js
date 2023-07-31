import './index.css';
import App from './App';
import Navbar from './components/navbar';
import Footer from './components/Footer';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

ReactDOM.render(
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <link href="https://cdn.jsdelivr.net/npm/boosted@5.2.3/dist/css/boosted.min.css" rel="stylesheet" integrity="sha384-zYFw+mxKy6r9zpAc1NoGiYBfQmxfvg7ONEMr81WeU+WLPPaLC9QTrNGFJTBi3EIn" crossorigin="anonymous"></link>
            </head>
            <body>
                <div id="root">
                  <div className='App'>
                <React.StrictMode>
                <BrowserRouter>
                <Navbar></Navbar>
                  <App/>
                <Footer></Footer>
                </BrowserRouter>
                </React.StrictMode>
                  </div>
                </div>
            </body>
        </html>
        ,document.getElementById('root')
);
