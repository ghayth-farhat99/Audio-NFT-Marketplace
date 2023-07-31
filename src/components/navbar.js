import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams,
  } from "react-router-dom";
  import logo from '../images/orange-logo.svg'
  import { useEffect, useState } from 'react';
  import { useLocation } from 'react-router';
  
  function Navbar() {
  
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState('0x');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  function handleLinkClick() {
    handleToggle();
    // do any additional logic for link click here
  }

  async function getAddress() {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    updateAddress(addr);
  }
  
  function updateButton() {
    const ethereumButton = document.querySelector('.enableEthereumButton');
    ethereumButton.textContent = "Connected";
  }
  
  async function connectWebsite() {
  
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if(chainId !== '0x5')
      {
        //alert('Incorrect network! Switch your metamask network to Rinkeby');
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }],
       })
      }  
      await window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => {
          updateButton();
          console.log("here");
          getAddress();
          window.location.replace(location.pathname)
        });
  }
  
    useEffect(() => {
      let val = window.ethereum.isConnected();
      if(val)
      {
        console.log("here");
        getAddress();
        toggleConnect(val);
        updateButton();
       
      }
      window.ethereum.on('accountsChanged', function(accounts){
        window.location.replace(location.pathname)
      })
    });
  
      return (
          <nav className="nav navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <Link to="/">
              <div className="navbar-brand">
                <a className="stretched-link">
                  <img src={logo} width="50" height="50" alt="Boosted - Back to Home" loading="lazy" />
                </a>
                <h1 className="title">Audio NFT Marketplace</h1>
              </div>
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              onClick={handleToggle}
              aria-controls="navbarSupportedContent"
              aria-expanded={!isCollapsed}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse align-items-end${isCollapsed ? '' : ' show'}`} id="navbarSupportedContent">
              <ul className="navbar-nav me-auto">
                {location.pathname === "/" ?
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/">Marketplace</Link>
                  </li>
                  :
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/">Marketplace</Link>
                  </li>
                }
                {location.pathname === "/Rented" ?
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/Rented">Rented NFTs</Link>
                  </li>
                  :
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/Rented">Rented NFTs</Link>
                  </li>
                }
                {location.pathname === "/sellNFT" ?
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/sellNFT">Create NFT</Link>
                  </li>
                  :
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/sellNFT">Create NFT</Link>
                  </li>
                }
                {location.pathname === "/All NFTs" ?
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/All NFTs">All NFTs</Link>
                  </li>
                  :
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/All NFTs">All NFTs</Link>
                  </li>
                }
                {location.pathname === "/profile" ?
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/profile">Profile</Link>
                  </li>
                  :
                  <li className="nav-item">
                    <Link className="nav-link" onClick={handleLinkClick} to="/profile">Profile</Link>
                  </li>
                }
                
           {/* Wallet connection component */}
          
            <li className="nav-item ml-auto">
              <button className="enableEthereumButton btn btn-primary btn-inverse" onClick={connectWebsite}>
                {connected ? "Connected" : "Connect Wallet"}
              </button>
              <div className="text-white text-bold text-right text-sm">
                {currAddress !== "0x" ? "Connected to" : "Not Connected. Please login to view NFTs"}{" "}
                {currAddress !== "0x" ? currAddress.substring(0, 15) + "..." : ""}
              </div>
            </li>
          </ul>

    </div>
  </div>
</nav>

          
      );
    }
  
    export default Navbar;