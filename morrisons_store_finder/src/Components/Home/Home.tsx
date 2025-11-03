import "./Home.css"
import React from 'react'
import SearchFeature from "../SearchFeature/SearchFeature"



function Home() {
  return (
    <div> 
        <section className="main ">
            <SearchFeature/>
        </section>
    </div>
  )
}

export default Home