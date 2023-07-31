import { BrowserRouter as Router, Link } from "react-router-dom";
import { React, useState, useEffect } from "react";
import play from '../images/play.png'
import stop from '../images/stop.png'

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }
    const audioUrl = data.data.audio;
        const [isPlaying, setIsPlaying] = useState(false);
    
    const handlePlay = () => {
        setIsPlaying(!isPlaying);
        };
    

        
    return (
        <div className="">
        <div className="card " style={{ width: '15rem', marginLeft: '1rem', marginBottom: '2rem', marginTop : '1rem' }}>
          <div className="card-header">
          
            {isPlaying ? (<img
                            src={stop}
                            className="card-img-top"
                            alt="Stop"
                            onClick={handlePlay}
                            
                            />
                        ) : (
                            <img
                            src={play}
                            className="card-img-top"
                            alt="Play"
                            onClick={handlePlay}
                            
                            />
                        )}
                        {/* Render the audio element, but keep it hidden until the play button is clicked */}
                        {isPlaying && <div
                            style={{
                                marginTop: '10px', // Adjust the spacing between the image and the audio element
                                width: '100%',
                                overflowX: 'hidden',
                            }}
                            >
                            <audio src={audioUrl} className="show" autoPlay controls style={{ width: '100%' }} />
                            </div>}

          </div>
        <Link to={newTo}>
            
            <div className= "card-body">
                <strong className="card-title">{data.data.name}</strong>
                <p className="card-text">
                    {data.data.description}
                </p>
            </div>
        
        </Link>
        </div>
        </div>
    )
}

export default NFTTile;
