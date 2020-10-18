import React, { Component } from 'react';

export const OwnerPage = (props) => {
    const welcome = "Owner role has been selected yet"
    const next = "This will display status of project in the future"
        return ( 
            <React.Fragment>
                <h5>{welcome}</h5>
                {next}
            </React.Fragment>
         );
    }
