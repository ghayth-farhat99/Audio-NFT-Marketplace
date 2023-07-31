import './App.css';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import SellNFT from './components/SellNFT';
import NFTPage from './components/NFTpage';
import ReactDOM from "react-dom/client";
import MyNFTs from './components/MyNFTs';
import Rented from './components/Rented';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div >
        <Routes>
          <Route path="/" element={<Marketplace/>} />
          <Route path="/nftPage/:tokenId" element={<NFTPage />} />        
          <Route path="/profile" element={<Profile />} />
          <Route path="/Rented" element={<Rented />} />
          <Route path="/sellNFT" element={<SellNFT />} />             
          <Route path="/All NFTs" element={<MyNFTs />} />             
        </Routes>

    </div>
  );
}

export default App;
