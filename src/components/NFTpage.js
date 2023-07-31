import React, { useState, useEffect } from "react";
import { useLocation, useParams } from 'react-router-dom';
import NFT from "../NFT.json";
import Marketplace from "../Marketplace.json";
import audio from '../images/audioImage.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [formParams, updateFormParams] = useState({ price: '' , duration: ''});
  const [rentduration, setRentDuration] = useState();
  const [nftContractAddress,setNftContractAddress] = useState("0x");
  const [dataFetched, updateDataFetched] = useState(false);
  const [owner , setowner] = useState("0x");
  const [isOwner , setIsOwner] = useState(false);
  const [rentalPrice,setRentalPrice] = useState();
  const [endDate , setEndDate] = useState('');
  const [startDate , setStartDate] = useState('');
  const [listed, setListed] = useState(false);
  const [rented, setRented] = useState(false);
  const [expirationDate , setExpirationDate] = useState();
  const [user, setUser] = useState("0x");
  const [isLoading, setIsLoading] = useState(false);
  

  async function getNFTData(tokenId) {
    setIsLoading(true);
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    
    let contractNFT = new ethers.Contract(NFT.address, NFT.abi, signer);
    let contractMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
    
    setNftContractAddress(NFT.address);
    const tokenUri = await contractNFT.tokenURI(tokenId);
    const response = await fetch(tokenUri);
    const data = await response.json();
    const Owner = await contractNFT.ownerOf(tokenId);
    
    let i = 0;
    while (true) {
      try {
        const tokenIdListed = await contractMarketplace.getAllListings();
        
        if(tokenIdListed[i][3].toString() == tokenId){

          if(Date.now() < tokenIdListed[i][6].toString()*1000){

              if(Date.now() < tokenIdListed[i][7].toString()*1000){

                if(tokenIdListed[i][1] == addr){
                  setRented(true);
                  setUser(tokenIdListed[i][1]);
                  setExpirationDate(new Date(tokenIdListed[i][7]*1000).toLocaleString());
                  setStartDate(new Date(tokenIdListed[i][5] * 1000).toLocaleString());
                  setEndDate(new Date(tokenIdListed[i][6] * 1000).toLocaleString());
                  setRentalPrice(ethers.utils.formatEther(tokenIdListed[i][4].toString()));
                  updateData(data);
                  updateDataFetched(true);
                  break;
                }
                
                else{
                  if(tokenIdListed[i][0] == addr){
                    setUser(tokenIdListed[i][1]);
                    setRented(true);
                    setStartDate(new Date(tokenIdListed[i][5] * 1000).toLocaleString());
                    setEndDate(new Date(tokenIdListed[i][6] * 1000).toLocaleString());
                    setRentalPrice(ethers.utils.formatEther(tokenIdListed[i][4].toString()));
                    updateData(data);
                    updateDataFetched(true);
                    setListed(true);
                  }
      
                  else{
                    break;
                  }
                }
              }
              else{
                
                setStartDate(new Date(tokenIdListed[i][5] * 1000).toLocaleString());
                setEndDate(new Date(tokenIdListed[i][6] * 1000).toLocaleString());
                setRentalPrice(ethers.utils.formatEther(tokenIdListed[i][4].toString()));
                updateData(data);
                updateDataFetched(true);
                setListed(true);
              }

          }
          break;
        }
        
        i++;
      } catch (error) {
        setIsLoading(false);
        break;
      }
    }
    setowner(Owner);

    if(addr == Owner){
      updateData(data);
      setIsOwner(true);
      updateDataFetched(true);}
      
    setIsLoading(false);
    }
    
    // List Function
    async function list(e) {
      e.preventDefault();
      try {
        setIsLoading(true);
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        let contractMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
        
    const { price, duration } = formParams;
    
    const pricePerDay = ethers.utils.parseUnits(price, 'ether');
    const buffer = 30;
    const start = Math.ceil(Date.now() / 1000) + buffer;
    const end = start + (duration * 24 * 60 * 60);
    const listingFee = await contractMarketplace.getListingFee();
    console.log(listingFee);
    const tx = await contractMarketplace.listNFT(
      nftContractAddress,
      tokenId,
      pricePerDay,
      start,
      end,
      { value: listingFee }
      );
      await tx.wait();
      setIsLoading(false);
      toast.success("Successfully listed your NFT!");
      updateFormParams({ price: '', duration: ''});
    } catch(e) {
      setIsLoading(false)
      toast.error("List " + e);
  }
}

//Unlist function 
async function Unlist(){
  try {
    setIsLoading(true);
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    let contractMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
    let contractNFT = new ethers.Contract(NFT.address,NFT.abi, signer);

    const expires = parseInt(await contractNFT.userExpires(tokenId));
    const pricePerDay = rentalPrice;
    
    const refund = Math.ceil((expires - Date.now() / 1000) / 60 / 60 / 24 + 1) * pricePerDay;

    const tx = await contractMarketplace.unlistNFT(
      nftContractAddress,
      tokenId,
      { value: Math.max(0, refund) }
      );
      await tx.wait();
      setIsLoading(false);
      toast.success("Successfully unlisted your NFT!");
    } catch(e) {
      setIsLoading(false);
      toast.error("Upload " + e);
  }
} 


// Rent Function 
async function Rent(e){
  e.preventDefault();
  try{
    setIsLoading(true);
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    let contractMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
    
    const pricePerDay = ethers.utils.parseEther(rentalPrice);
    const now = Math.ceil(Date.now() / 1000);
    const expires = now + rentduration * 24 * 60 * 60 ;
    const numDays = Math.round((expires - now) / 60 / 60 / 24);
    const fee = numDays * pricePerDay;
    
    const options = {value: fee.toString()};
    console.log("options",options);
    const tx = await contractMarketplace.rentNFT(nftContractAddress, tokenId, expires,numDays, options);
    await tx.wait();
    setIsLoading(false);
    toast.success("Successfully rented NFT!");
  }catch(e){
    setIsLoading(false);
    toast.error("Rent " + e);
  }
}

const params = useParams();
const tokenId = params.tokenId;

  useEffect(() => {
    if (!dataFetched) {
      getNFTData(tokenId);
    }
  }, []);

  return (
      <div className="card mb-3 flex" style={{marginTop:'2rem', marginBottom:'2rem', marginLeft:'4rem', marginRight:'4rem'}}>
        <ToastContainer />
        <div className="row g-0">
          {isLoading?(
            <div className="spinner-container" style={{marginTop:'1rem', marginLeft:'1rem'}}>
              <div className="loading-spinner">
              </div>
            </div>
          ):(
            <div>

            </div>
          )}
          
        <div className="col-md-4" style={{marginBottom: '1rem'}}>
          <img src={audio} className="img-fluid" />
          {dataFetched && (
            <audio controls  className="audio-player">
              <source src={data.audio} type="audio/mpeg" />
            </audio>
          )}
        </div>
        
        <div className="col-md-8">
            <div className="card-body">

          <div className="card-title">
            Name: {data.name}
          </div>
          <div className="card-text fw-bold mb-2">
            Description: {data.description}
          </div>
          <div className="card-text">
            Owner: <span className="text-sm">{owner}</span>
          </div>
          {dataFetched && <div>
            {isOwner? (
                <div>
                {listed?(
                        <div>
                          <div className="card-group text-center mt-1">
                            <div className="card"> 
                              <h6 className="mt-1">Start Date of Listing :</h6>
                              {startDate} 
                            </div>
                            <div className="card"> 
                              <h6 className="mt-1">End Date of Listing :</h6>
                                {endDate} 
                            </div>
                          </div>
                          <h4 className="mt-4">Cost Per Day : {rentalPrice} ETH </h4>
                          <div>
                            {rented?(
                              <div className="mt-2" style={{marginLeft: '1rem'}}> 
                              <h4>User : {user}</h4>
                              <h4 className="mt-2">expiration Date : {expirationDate}</h4>
                              <h4 className="text-rented-owner">Rented</h4>
                              </div>
                            ):(
                              <div className="mt-4">
                                <h4 className="text-rented">Not Rented</h4>
                              </div>
                            )}
                          </div>
                          <button type="submit" className="btn btn-primary" onClick={Unlist}>Unlist NFT</button>
                        </div>
                        ):(
                        <form>
                          <fieldset>
                                  <div className="mb-2 mt-2">
                                  <label for="requiredTextInput" className="form-label is-required" htmlFor="name">Price</label>
                                  <input type="number" step="0.01" id="requiredTextInput" name="price" className="form-control" onChange={e => updateFormParams({...formParams, price: e.target.value})} value={formParams.price} placeholder="Price Per Day (Min 0.01 ETH)" required/>
                                  </div>
              
                                  <div className="mb-2">
                                  <label for="requiredTextInput" className="form-label is-required" htmlFor="name">Duration</label>
                                  <input type="number" id="requiredTextInput" name="duration" className="form-control" onChange={e => updateFormParams({...formParams, duration: e.target.value})} value={formParams.duration} placeholder="Nbr Of Days" required/>
                                  </div>
              
                                  <button type="submit" className="btn btn-primary mt-2" onClick={list}>List NFT</button>
                          </fieldset>
                        </form>
                )}
                </div>
            ):(
              <div>
                {rented?(
                        <div className="mt-4" style={{marginLeft: '2rem'}}> 
                          <h4 className="text-rented">rented</h4>
                          <div className="card-group text-center mt-1">
                            <div className="card"> 
                              <h6 className="mt-1">Start Date of Listing :</h6>
                              {startDate} 
                            </div>
                            <div className="card"> 
                              <h6 className="mt-1">End Date of Listing :</h6>
                                {endDate} 
                            </div>
                          </div>
                          <h4 className="mt-4">
                            <span className="title">Cost Per Day </span> <span className="value">{rentalPrice} ETH</span>
                          </h4>
                          <h4>
                            <span className="title">User </span> <span className="value">{user}</span>
                          </h4>
                          <h4 className="mt-2">
                            <span className="title">Expiration Date </span> <span className="value" id="expirationDate">{expirationDate}</span>
                          </h4>

                        </div>):(<div>
                  
                      <div className="card-group text-center mt-1">
                      <div className="card">
                        <h6 className="mt-1">Start Date of Listing :</h6>
                        <span className="date">{startDate}</span>
                      </div>
                      <div className="card">
                        <h6 className="mt-1">End Date of Listing :</h6>
                        <span className="date">{endDate}</span>
                      </div>

                      </div>
                      <div className="mt-1">
                            Cost Per Day : {rentalPrice} ETH
                      </div>
                        <form>
                          <fieldset>
                                <div className="mb-2 mt-2">
                                <label for="requiredTextInput" className="form-label is-required" htmlFor="name">Duration</label>
                                <input type="number" id="requiredTextInput" name="rentduration" className="form-control" onChange={e => setRentDuration(e.target.value)} value={rentduration} placeholder="Nbr Of Days" required />
                                </div>

                                <button type="submit" className="btn btn-primary mt-2" onClick={Rent}>Rent NFT</button>
              
                          </fieldset>
                        </form>
                      </div>

                        )}
                      
                  </div>
            )}
            </div>}

          </div>        
        </div>
        </div>
        </div>
    )
    

  }
    // console.log("owner",tokenIdListed[i][0]);
    // console.log("user",tokenIdListed[i][1]);
    // console.log("nftContract",tokenIdListed[i][2]);
    // console.log("tokenId",tokenIdListed[i][3].toString());
    // console.log("pricePerDay",tokenIdListed[i][4].toString());
    // console.log("startDateUNIX",tokenIdListed[i][5].toString());
    // console.log("startDateUNIX",new Date(tokenIdListed[i][5].toString()*1000));
    // console.log("endDateUNIX",tokenIdListed[i][6].toString());
    // console.log("endDateUNIX",new Date(tokenIdListed[i][6].toString() * 1000));
    // console.log("expires",tokenIdListed[i][7].toString());
    
    
    // var timeStamp = Date.now();
    // const dateFormat = new Date(timeStamp);
    // console.log("date",dateFormat);
    // // now i want to add 10 Days to this date 
    // console.log(new Date(timeStamp + 10 * 24 * 60 * 60 * 1000));