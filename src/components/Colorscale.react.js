import React, { Component, PropTypes } from 'react';
import chroma from 'chroma-js';

export default class Colorscale extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        const N_SWATCHES = 6;
        const DEFAULT_SCALE = chroma.scale(['#fafa6e','#2A4858'])
              .mode('lch')
              .colors(N_SWATCHES);
        let scale = DEFAULT_SCALE;

        if (this.props.colorscale) {
            scale = this.props.colorscale;
        }

        return (
            <div
                className='colorscale-block'
                style={{display:'inline-block', margin:'10px 20px'}}
                onClick={() => this.props.onClick(scale, this.props.start, this.props.rot)}
            >
                <span
                    style={{
                        textAlign: 'center', 
                        fontWeight:600, 
                        fontSize: '12px', 
                        color: '#2a3f5f', 
                        marginRight: '10px', 
                        verticalAlign: 'top'
                    }}
                >
                    {this.props.label || ''}
                </span>
                {scale.map((x, i) =>
                    <div
                       key={i}
                       className='colorscale-swatch'    
                       style={{
                           backgroundColor: x,
                           width: '20px',
                           height: '20px',
                           margin: '0 auto',
                           display: 'inline-block',
                           cursor: 'pointer'
                       }}
                    />
                )}
            </div>
        );
    }
}
