import React from 'react';

import './Dropdown.css';


const Dropdown = (props) => {

    return(
        <div className="dropdown">
            <button className="dropbtn">{props.name}</button>
            <div className="dropdown-content">
                {props.options.map( (option) => {
                    return(<div onClick={option.action}>{option.name}</div>);
                })}
            </div>
        </div>
    );
}


export default  Dropdown;
