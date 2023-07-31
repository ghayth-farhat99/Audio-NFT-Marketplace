import {React, useState, useEffect } from "react";
import NFT from '../NFT.json';
import marketplaceContract from '../Marketplace.json';
import NFTTile from "./NFTTile";

function Marketplace(){
    const [dataFetched, updateFetched] = useState(false);
    const [data, updateData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    async function getData(){
        
        setIsLoading(true);
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        let contractMarketplace = new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, signer);
        let contractNFT = new ethers.Contract(NFT.address,NFT.abi,signer);

        const tokenData = [];
        let i = 0;
        while (true) {
        try {
            const tokenIdListed = await contractMarketplace.getAllListings();
            console.log(tokenIdListed);
            const id = tokenIdListed[i][3].toString();
            if((tokenIdListed[i][1] == '0x0000000000000000000000000000000000000000' || (tokenIdListed[i][1] != '0x0000000000000000000000000000000000000000') && Date.now() > tokenIdListed[i][7].toString()*1000) && Date.now() < tokenIdListed[i][6].toString()*1000){

                const tokenUriPromise = contractNFT.tokenURI(id);
                const tokenUri = await tokenUriPromise;
                const response = await fetch(tokenUri);
                const data = await response.json();
                console.log(data)
                
                let item ={
                    tokenId : id ,
                    audio:data.audio,
                    name: data.name,
                    description: data.description,
                }
                tokenData.push(item);
            }
            i++;
        }catch (error) {
            setIsLoading(false);
            break;
        }
        }
        updateData(tokenData);
        updateFetched(true);
        setIsLoading(false);
    }
    useEffect(() => {
        if (!dataFetched) {
        getData();
        }
    }, []);
    return(
            <div className="conatinerPage">   
            <div className="flex flex-col text-center items-center mt-4">
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
            </div>
    );
}
export default Marketplace;