import {React,useState, useEffect} from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import NFT from '../NFT.json';
import { useLocation } from "react-router";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SellNFT(){
    const [formParams, updateFormParams] = useState({ name: '', description: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();
    const [inputValue, setInputValue] = useState(null);
    const [outputValue, setOutputValue] = useState(false);
    const [msg1, setmsg1] = useState("");
    const [msg2, setmsg2] = useState("");
    const [dataFetched, updateFetched] = useState(false);
    const [data, updateData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

  // get Data Function 
  async function getData(){
        
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    let contractNFT = new ethers.Contract(NFT.address,NFT.abi,signer);

    const tokenData = [];
    let i = 1;
    while (true) {
      try {
        const tokenUri = await contractNFT.tokenURI(i);
        const response = await fetch(tokenUri);
        const data = await response.json();
        
        let item ={
            tokenId : i ,
            audio:data.audio,
            name: data.name,
            description: data.description,
        }
        // create a new FormData object and append the audio file and its name to it
        const formData = new FormData();
        formData.append('audio', new File([data.audio], `${data.name}.wav`));
        formData.append('name', data.name);

        // make a POST request to the Flask endpoint with the FormData object
        fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('File uploaded successfully:', data);
            // display the audio file using the original filename as the name
            const audio = new Audio(`audio/${data.audio}`);
            // ...
        })
        .catch((error) => {
            console.error('Error uploading file:', error);
        });
        tokenData.push(item);
        
        i++;
    }catch (error) {
        break;
    }
    }
    console.log("name",tokenData.name);
    updateData(tokenData);
    updateFetched(true);
   
}



  //This function uploads the NFT audio to IPFS
  async function OnChangeFile(e) {
    var file = e.target.files[0];
    setInputValue(e.target.files[0]);
    setOutputValue(false);
    setmsg1("");
    setmsg2("");
    //check for file extension
    try {
      //upload the file to IPFS
      const response = await uploadFileToIPFS(file);
      
      if(response.success === true) {
        console.log("Uploaded audio to Pinata: ", response.pinataURL)
        setFileURL(response.pinataURL);
      }
    }
    catch(e) {
      console.log("Error during file upload", e);
    }
    }
    
    
// check function
async function check(e) {
  e.preventDefault();
  setIsChecking(true);
  const formData = new FormData();
  formData.append("file", inputValue);
  fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const outputData = data.output;
      if (outputData) {
        setmsg1("Great, a new voice");
      } else {
        setmsg2("You should upload a new voice model");
      }
      setOutputValue(outputData);
    })
    .catch((error) => {
      console.error(error);
      setIsChecking(false); // Set isChecking to false if an error occurs
    })
    .finally(() => {
      setIsChecking(false); // Set isChecking to false regardless of success or error
    });
}


    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
      const { name, description } = formParams;
      // Make sure that none of the fields are empty
      if (!name || !description || !fileURL) {
        return;
      }

      const nftJSON = {
        name,
        description,
        audio: fileURL,
      };

      try {
        // Upload the metadata JSON to IPFS
        const response = await uploadJSONToIPFS(nftJSON);
        if (response.success === true) {
          console.log("Uploaded JSON to Pinata: ", response);
          return response.pinataURL;
        }
      } catch (e) {
        console.log("Error uploading JSON metadata:", e);
      }
    }

    // list NFT function
    async function MintNFT(e) {
        e.preventDefault();
        setIsLoading(true);
        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            
            //After adding your Hardhat network to your metamask, this code will get providers and signers
           
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            updateMessage("Please wait.. uploading (upto 5 mins)")
            //Pull the deployed contract instance
            let contractNFT = new ethers.Contract(NFT.address, NFT.abi, signer)

            //actually create the NFT
            let transaction = await contractNFT.mint(metadataURL)
            await transaction.wait()
            setIsLoading(false);
            toast.success("Successfully created your NFT!");
            updateMessage("");
            updateFormParams({ name: '', description: ''});
            window.location.replace("/profile")
        }
        catch(e) {
          setIsLoading(false);
          toast.error( "Upload error"+e )
        }
    }

    useEffect(() => {
      if (!dataFetched) {
      getData();
      }
      }, []); 

      
    console.log("Working", process.env);
    return(
            <div>
              <ToastContainer />
            <br/>
            <form className="form mb-3 mt-4" style={{marginLeft:'3rem', marginRight:'3rem'}}>
            <h3>Upload your NFT to the marketplace</h3>
                <fieldset>
                    <div className="mb-3 mt-4">
                    <label for="requiredTextInput" className="form-label is-required" htmlFor="name">NFT Name</label>
                    <input type="text" id="requiredTextInput" name="name" className="form-control" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name} placeholder="Asset Name" required/>
                    </div>
                    
                    <div className="mb-3 mt-4" >
                    <label for="requiredTextInput" className="form-label is-required" htmlFor="description">NFT Description</label>
                    <input type="text" id="requiredTextInput" name="description" className="form-control" onChange={e => updateFormParams({...formParams, description: e.target.value})} value={formParams.description} placeholder="Asset Description" required/>
                    </div>

                    <div className="mb-3">
                    <label for="requiredTextInput" className="form-label is-required" htmlFor="audio">Upload Voice</label>
                    <input  type={"file"} name="file" accept="audio/*" onChange={OnChangeFile} required/>
                    </div>

                    <div className="mb-3">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="requiredFieldsetCheck" checked={outputValue} onClick={check} required/>
                        <label className="form-check-label" for="requiredFieldsetCheck">Must check this Voice</label>
                        <div>
                          {isChecking?(
                            <div className="spinner-container" style={{marginTop:'1rem', marginLeft:'1rem'}}>
                            <div className="loading-spinner">
                            </div>
                            </div>
                            ):(
                                <div>

                                </div>
                          )}
                        </div>
                    <div> {outputValue?(
                      <div><p className="available">{msg1}</p></div>
                    ):(<div><p className="not-available">{msg2}</p></div>)}</div>
                    </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-2" disabled={!outputValue} 
                      style={outputValue ? {marginBottom:'1rem'} : { marginBottom:'1rem' }} onClick={MintNFT}>Mint NFT</button>
                </fieldset>
                </form>
                {isLoading?(
                <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom:'1rem'}}>
                <div className="loading-spinner">
                </div>
                </div>
                ):(
                    <div>

                    </div>
                )}
            </div>
    );
}
export default SellNFT;
