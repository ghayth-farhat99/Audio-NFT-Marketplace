import React, { useState, useEffect } from "react";
import Marketplace from '../Marketplace.json';
import NFT from '../NFT.json';
import { useParams } from 'react-router-dom';
import axios from "axios";
import NFTTile from "./NFTTile";

function Profile() {
  const [data, updateData] = useState([]);
  const [address, updateAddress] = useState("0x");
  const [Balance, setBalance] = useState('')
  const [dataFetched, updateFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { walletAddress } = useParams(); // Get the wallet address from the URL params

  useEffect(() => {
    getNFTData(walletAddress); // Pass the wallet address to the function
  }, [walletAddress]);

  async function getNFTData(walletAddress) {

    setIsLoading(true);
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = walletAddress || (await signer.getAddress()); // Use the provided wallet address or fetch the signer's address
    const balance = await signer.getBalance();
    const formattedBalance = ethers.utils.formatEther(balance);
    setBalance(formattedBalance);
    console.log(Balance);
    let contractNFT = new ethers.Contract(NFT.address, NFT.abi, signer);

    const tokenData = [];
    let i = 1;
    while (true) {
      try {
        const ownerI = await contractNFT.ownerOf(i);
        if(ownerI == addr){

          const tokenUriPromise = contractNFT.tokenURI(i);
          const tokenUri = await tokenUriPromise;
  
          const response = await fetch(tokenUri);
          const data = await response.json();
          console.log(data);
          let item ={
            tokenId : i ,
            owner : ownerI ,
            audio:data.audio,
            name: data.name,
            description: data.description,
          }
          tokenData.push(item);
        }
        i++;
      } catch (error) {
        setIsLoading(false);
        break;
      }
    }

    updateData(tokenData);
    updateAddress(addr);
    updateFetched(true);
    setIsLoading(false);
  }

  return (
      <div className="container">
        <div>

          <div className="card-group text-center" style={{ marginTop:'2rem', marginBottom:'1rem'}}>
            <div className="card">
              <div className="mt-2 mb-2">
                <h2>Nb. of NFTs</h2>
                {data.length}
              </div>
              
            </div>

            <div className="card">
              <div className="mt-2 mb-2">
              <h2>Wallet Address</h2>
              {address}
              </div>
            </div>
        
            <div className="card">
              <div className="mt-2 mb-2">
                <h2>Balance Value</h2>
                {Balance} ETH
              </div>
            </div>
        
        </div>
      </div>
      {isLoading?(
            <div className="spinner-container" style={{ marginBottom:'1rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div className="loading-spinner">
              </div>
            </div>
          ):(
            <div>

            </div>
          )}
      <div className="flex flex-col text-center items-center ">
                <h2>Your NFTs</h2>
                <div className="card-group">
                    {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
                <h6 className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                </h6>
            </div>
      </div>
      
  );
}

export default Profile;



    //       //test marketplace contract
    //       console.log("getAllListings", marketplaceContract.getAllListings());
    //       console.log("isRentableNFT", marketplaceContract.isRentableNFT(NFT.address));
          
          
    //       //test nft contract
    //         console.log("ownerOf" ,contractNFT.ownerOf(1));
    //         console.log("userExpires",contractNFT.userExpires(1));
    //         console.log("userOf",contractNFT.userOf(1));
    //         console.log("getApproved",contractNFT.getApproved(1));
    //         console.log("balanceOf",contractNFT.balanceOf(contractNFT.ownerOf(1)));
    //         console.log("name",contractNFT.name());