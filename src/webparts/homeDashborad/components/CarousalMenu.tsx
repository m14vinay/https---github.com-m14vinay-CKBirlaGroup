import * as React from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

export default function CarousalMenu() {
    return (
        <div>
            <Carousel responsive={responsive} itemClass="carousel-item-padding-40-px" containerClass="carousel-container">
                <div style={{backgroundImage:"../assets/logo.png", height:"200px"}}>
                    <h4>Upload Document for Reimbursement & Bill Processing</h4>
                    <label>Upload Bills and get the uniquie bill reference nymber to use in the bill processing and Reimbursement forms.</label>
                    <button>Upload new button</button>
                </div>
                <div style={{backgroundImage:"../assets/logo.png", height:"200px"}}>
                    <h4>Upload Document for Reimbursement & Bill Processing</h4>
                    <label>Upload Bills and get the uniquie bill reference nymber to use in the bill processing and Reimbursement forms.</label>
                    <button>Upload new button</button>
                </div>
                <div style={{backgroundImage:"../assets/logo.png", height:"200px"}}>
                    <h4>Upload Document for Reimbursement & Bill Processing</h4>
                    <label>Upload Bills and get the uniquie bill reference nymber to use in the bill processing and Reimbursement forms.</label>
                    <button>Upload new button</button>
                </div>
                <div style={{backgroundImage:"../assets/logo.png", height:"200px"}}>
                    <h4>Upload Document for Reimbursement & Bill Processing</h4>
                    <label>Upload Bills and get the uniquie bill reference nymber to use in the bill processing and Reimbursement forms.</label>
                    <button>Upload new button</button>
                </div>
            </Carousel>
        </div>
    )
}