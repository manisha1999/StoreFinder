import React, { useState } from 'react'
import './SearchFeature.css'


type Coordinates = {
    lat: number;
    lon: number;
};


function SearchFeature() {
    const [postcode, setPostcode] = useState("");
    const [coords, setCoords] = useState<Coordinates | null>(null);
    const [error, setError] = useState("");
    const [clicked, setClicked] = useState(false);



    async function fetchCoordinates(postcode: string): Promise<Coordinates> {
        const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${GOOGLE_MAPS_API_KEY}&components=country:GB`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Geocoding API failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)

        if (data.status !== "OK" || data.results.length === 0) {
            throw new Error("Postcode not found or invalid.");
        }

        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lon: lng };
    }

    const handleSearch = async () => {
        setError("");
        setCoords(null);

        if (!postcode.trim()) {
            setError("Please enter a postcode.");
            return;
        }

        try {
            const result = await fetchCoordinates(postcode);
            setCoords(result);
             
        } catch (err: any) {
            setError(err.message);
        }
    };
    const handleSearchClick = () => {
        setClicked(true);
        handleSearch(); // original search function
      };

    return (
        <div >

            <div className='search_section'>

            <div className="heading">
        <h1>Welcome to your Morrisons Store Finder</h1>
        <p>Enter a postcode or town below to search for your nearest store and find its opening times</p>
    </div>
               
                <div className='input_section'>

                <div className="input_container">
                    {/* <img src="search_icon" alt="search icon" className="icon" /> */}
                    <svg className="icon" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 
                                6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 
                                4.23-1.57l.27.28v.79l5 5L20.49 
                                19l-5-5zm-6 0C8.01 14 6 11.99 
                                6 9.5S8.01 5 9.5 5 13 7.01 13 
                                9.5 10.99 14 9.5 14z"/>
                        </svg>

                    <input
                        className="input_button"
                        type="text"
                        placeholder="Enter Postcode or location"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                    />

                    <img src="current_location_icon" alt="location icon" className="icon" />
                </div>

                <button 
                    className={`search_button ${clicked ? "clicked" : ""}`} 
                    onClick={handleSearchClick}
                    >
                    Search
                </button>
            </div>

                {/* {coords && (
          <p>
            ✅ Coordinates: <strong>Lat:</strong> {coords.lat}, <strong>Lon:</strong> {coords.lon}
          </p>
        )} */}

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}

export default SearchFeature