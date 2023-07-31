
import React, { useState, useEffect } from "react";
import NFT from '../NFT.json';
import { useParams } from 'react-router-dom';
import NFTTile from "./NFTTile";

function MyNFTs() {
  const [data, updateData] = useState([]);
  const [address, updateAddress] = useState("0x");
  const [isLoading, setIsLoading] = useState(false);
  const [contractOwner , setcontractOwner] = useState(false);

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
  
    let contractNFT = new ethers.Contract(NFT.address, NFT.abi, signer);

    const tokenData = [];
    let i = 1;
    while (true) {
      try {
        const owner = contractNFT.ownerOf(i);
        const ownerI = await owner;
        if(ownerI == addr || addr == "0x50b4481d075f5516df2a2037D9c023Fc07417EdA"){
          if(addr == "0x50b4481d075f5516df2a2037D9c023Fc07417EdA"){
            setcontractOwner(true);
          }
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
    setIsLoading(false);
  }

  return (
      <div className="container">
       
      <div className="flex flex-col text-center items-center" style={{marginTop:'2rem'}}>
          {contractOwner?(
            <div>
                <h2>Your are the Owner</h2>
                <h3>All the NFTs :</h3>
                {isLoading?(
                <div className="spinner-container" style={{ marginBottom:'1rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div className="loading-spinner">
                </div>
                </div>
                ):(
                    <div>

                    </div>
                )}
                <div className="card-group">
                    {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
                <h6 className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                </h6>
            </div>
          ):(
            <h2>Your are not the owner</h2>
          )}
      
            </div>
      </div>
  );
}
export default MyNFTs;