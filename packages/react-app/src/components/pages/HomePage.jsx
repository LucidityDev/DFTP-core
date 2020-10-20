import React, { Component } from 'react';

export const HomePage = (props) => {
    const welcome = "No role has been selected yet. Please select one in the toggle above after connecting with a project."
        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
            </React.Fragment>
         );
    }
