import {React, useState, useEffect} from "react";
import NFT from '../NFT.json';
import marketplaceContract from '../Marketplace.json';
import NFTTile from "./NFTTile";

function Rented(){

    const [dataFetched, updateFetched] = useState(false);
    const [data, updateData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenearting] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [selectedAudio, setSelectedAudio] = useState(null);


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
           
            if(tokenIdListed[i][1] == addr && Date.now() < (tokenIdListed[i][7].toString()*1000)){

                const id = tokenIdListed[i][3].toString();

                const tokenUriPromise = contractNFT.tokenURI(id);
                const tokenUri = await tokenUriPromise;
                const response = await fetch(tokenUri);
                const data = await response.json();
                
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

    async function generateAudio(event) {
      event.preventDefault();
      setIsGenearting(true);
      const formData = new FormData();
    
      // Download the audio file from the selected URL
      const audioBlob = await fetch(selectedAudio).then(response => response.blob());
      const audioFile = new File([audioBlob], 'audio.wav');
    
      formData.append('audioUrl', audioFile);
      formData.append('text', textInput);
    
      try {
        const response = await fetch('http://localhost:5000/generate-audio', {
          method: 'POST',
          body: formData,
        });
    
        if (response.ok) {
          const contentDisposition = response.headers.get('content-disposition');
          const filenameMatch = contentDisposition && contentDisposition.match(/filename=(.+)/);
          const filename = filenameMatch && filenameMatch[1] ? filenameMatch[1] : 'audio.wav';
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
    
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
    
          // Clean up the temporary URL
          window.URL.revokeObjectURL(url);
          setIsGenearting(false);
        } else {
          console.error('Error generating audio:', response.status);
          setIsGenearting(false);

        }
      } catch (error) {
        setIsGenearting(false);
        console.error('Error generating audio:', error);
      }
    }
    

    useEffect(() => {
        if (!dataFetched) {
        getData();
        }
    }, []);

    return(
        
        <div>

            <h5 className="text-xl text-center" style={{marginTop: '2rem'}}>
                {data.length == 0 ? "Oops, there is no NFT data to display. (Have you rented an NFT?)":""}
            </h5>
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
            <form className="form text-center" onSubmit={generateAudio}>

            <div className="mb-3 mt-4" style={{ marginLeft: '3rem', marginRight: '3rem' }}>
              <label htmlFor="audioSelect" className="form-label">Select Audio</label>
              <select className="form-select" id="audioSelect" value={selectedAudio} onChange={event => setSelectedAudio(event.target.value)}>
                <option value="">-- Select Audio --</option>
                {data.map((value, index) => (
                  <option key={index} value={value.audio}>{value.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3 mt-4" style={{marginLeft:'3rem', marginRight:'3rem'}}>
            <label for="exampleFormControlTextarea1" className="form-label">Enter Your Text</label>
            <textarea className="form-control" id="exampleFormControlTextarea1" placeholder="Write a sentence (+-20 words) to be synthesized:" rows="3" value={textInput} onChange={event => setTextInput(event.target.value)}></textarea>
            </div>

            <div >
                <button type="submit" className="btn btn-primary mb-3">Generate</button>
            </div>
            </form>

            {isGenerating?(
            <div className="line-spinner-container" style={{marginBottom : '2rem', marginTop : '2rem'}}>
              <div className="line-spinner text-center ">
              </div>
            </div>
            ):(
                <div>

                </div>
            )}
            
            
        </div>
    )
}
export default Rented;