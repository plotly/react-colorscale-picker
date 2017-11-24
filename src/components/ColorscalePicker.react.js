import React, { Component, PropTypes } from 'react';
import Colorscale from './Colorscale.react.js';
import chroma from 'chroma-js';

import {COLORSCALE_TYPES, COLORSCALE_DESCRIPTIONS, BREWER, CMOCEAN, CUBEHELIX, 
    DEFAULT_SCALE, DEFAULT_SWATCHES,DEFAULT_BREAKPOINTS, DEFAULT_START, DEFAULT_LOG_BREAKPOINTS,
    DEFAULT_ROTATIONS, DEFAULT_GAMMA, DEFAULT_LIGHTNESS, DEFAULT_NCOLORS} from './constants.js';

import '../index.css';
        
export default class ColorscalePicker extends Component {

    constructor(props) {
      	super(props);

        this.state = {
            nSwatches: this.props.nSwatches || DEFAULT_SWATCHES,
            colorscale: this.props.colorscale || DEFAULT_SCALE,
            previousColorscale: this.props.colorscale || DEFAULT_SCALE,
            colorscaleType: 'sequential',
            log: false,
            logBreakpoints: DEFAULT_LOG_BREAKPOINTS,
            customBreakpoints: DEFAULT_BREAKPOINTS,
            previousCustomBreakpoints: null,
            cubehelix: {
                start: DEFAULT_START,
                rotations: DEFAULT_ROTATIONS,
            }
        };

        this.getColorscale = this.getColorscale.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setColorscaleType = this.setColorscaleType.bind(this);
        this.updateCubehelixStart = this.updateCubehelixStart.bind(this);
        this.updateCubehelixRotations = this.updateCubehelixRotations.bind(this);
        this.updateCubehelix = this.updateCubehelix.bind(this);
        this.toggleLog = this.toggleLog.bind(this);
    }

    componentDidMount() {
        console.warn('mounting');
        this.setState({colorscaleOnMount: this.props.colorscale})
    }

    getColorscale = (colorscale, nSwatches, logBreakpoints, log) => {
    /*
     * getColorscale() takes a scale, modifies it based on the input
     * parameters, and returns a new scale
     */
        // helper function repeats a colorscale array N times
        let repeatArray = (array, n) => {
            let arrays = Array.apply(null, new Array(n)); 
            arrays = arrays.map(function() { return array });
            return [].concat.apply([], arrays);
        }

        let cs = chroma.scale(colorscale)
            .mode('lch');

        if (log) {
            const logData = Array(this.state.nSwatches).fill().map((x,i)=>i+1);           
            cs = cs.classes(chroma.limits(logData, 'l', logBreakpoints));
        }

        let discreteScale = cs.colors(this.state.nSwatches);

        // repeat linear categorical ("qualitative") colorscales instead of repeating them
        if (!log && this.state.colorscaleType === 'categorical') {
            discreteScale = repeatArray(colorscale, nSwatches).slice(0,nSwatches);
        }

        return discreteScale
    }

    toggleLog = () => {
        const cs = this.getColorscale(this.state.previousColorscale, 
                                      this.state.nSwatches, 
                                      this.state.logBreakpoints, 
                                      !this.state.log);

        this.setState({log: !this.state.log, colorscale: cs});

        this.props.onChange(cs);
    }

    onClick = (newColorscale, start, rot) => {
        const bp = this.state.customBreakpoints;
        const prevBp = this.state.previousCustomBreakpoints;

        if (bp === prevBp && this.state.colorscaleType === 'custom') {
            return;
        }

        const cs = this.getColorscale(newColorscale, 
                                      this.state.nSwatches, 
                                      this.state.logBreakpoints,
                                      this.state.log);

        let previousColorscale = newColorscale;
        if (this.state.colorscaleType === 'custom') {
            previousColorscale = this.state.previousColorscale;
        }

        if(!start && !rot) {
            this.setState({
                previousColorscale: previousColorscale,
                colorscale: cs,
                previousCustomBreakpoints: this.state.colorscaleType === 'custom' ? this.state.customBreakpoints : null,
            });
        }
        else {
            this.setState({
                previousColorscale: previousColorscale,
                colorscale: cs,
                previousCustomBreakpoints: null,
                cubehelix: {
                    start: start,
                    rotations: rot
                }
            });            
        }
        this.props.onChange(cs);
    }

    updateSwatchNumber = e => {
        const ns = e.currentTarget.valueAsNumber;

        const cs = this.getColorscale(
            this.state.previousColorscale,
            ns,
            this.state.logBreakpoints,
            this.state.log);
        
        this.setState({
            nSwatches: ns,
            colorscale: cs,
            customBreakpoints: DEFAULT_BREAKPOINTS
        });
        this.props.onChange(cs);
    }

    updateBreakpoints = e => {
        const bp = e.currentTarget.valueAsNumber;

        const cs = this.getColorscale(
            this.state.previousColorscale, 
            this.state.nSwatches,
            bp,
            this.state.log);

        this.setState({
            logBreakpoints: bp,
            colorscale: cs
        });

        this.props.onChange(cs);
    }

    updateBreakpointArray = e => {
        const bpArr = e.currentTarget.value.replace(/,\s*$/, '').split(',').map(Number);       
        this.setState({
            customBreakpoints: bpArr
        });
    }

    updateCubehelixStart = e => {
        const start = e.currentTarget.valueAsNumber;
        const rot = this.state.cubehelix.rotations;
        this.updateCubehelix(start, rot);
    }

    updateCubehelixRotations = e => {
        const rot = e.currentTarget.valueAsNumber;
        const start = this.state.cubehelix.start;
        this.updateCubehelix(start, rot);
    }

    updateCubehelix = (start, rot) => {
        const newColorscale = chroma.cubehelix()
              .start(start)
              .rotations(this.state.cubehelix.rotations)
              .gamma(DEFAULT_GAMMA)
              .lightness(DEFAULT_LIGHTNESS)
                  .scale()
                  .correctLightness()
                  .colors(DEFAULT_NCOLORS);

        this.onClick(newColorscale, start, rot);
    }
    
    setColorscaleType = csType => {
        if (csType !== this.state.colorscaleType) {
            let isLogColorscale = this.state.log;

            if(csType === 'custom') {
                isLogColorscale = false;
            }

            this.setState({
                colorscaleType: csType,
                log: isLogColorscale,
            });
        }
    }

    render() {
        
        return (
            <div className='colorscalePickerContainer'>
                <div className='colorscalePickerTopContainer'>
                    <div className='colorscale-selected'>
                        <Colorscale
                            colorscale={this.state.colorscale}
                            maxWidth={300}
                            onClick={() => {}}                           
                        />
                    </div>
                    <div className='colorscaleControlPanel'>
                        <div>
                           {this.state.colorscaleType !== 'custom' &&
                               <div className='noWrap inlineBlock alignTop'>
                                   <span className='textLabel spaceRight spaceLeft'>Log scale</span>
                                   <input 
                                       type="checkbox" 
                                       name="log" 
                                       value="log" 
                                       onChange={this.toggleLog} 
                                       defaultChecked={this.state.log} 
                                       className='spaceRightZeroTop alignTop'
                                   />
                                   {this.state.log &&
                                       <span>
                                           <span className='textLabel spaceRight spaceLeft'>Breakpoints: </span>
                                           <input 
                                               type="number" 
                                               step="1" min="1" max="10" 
                                               value={`${this.state.logBreakpoints}`} 
                                               onChange={this.updateBreakpoints} 
                                           />
                                       </span>
                                   }
                               </div>
                           }
                           <div className='noWrap inlineBlock'>
                               <span className='textLabel spaceRight'>Swatches:</span>
                               <span className='textLabel spaceRight'>{this.state.nSwatches}</span>
                               <input
                                   type="range"
                                   min="1"
                                   max="100"
                                   defaultValue={this.state.nSwatches}
                                   className="slider spaceRightZeroTop"
                                   onMouseUp={this.updateSwatchNumber}
                               />
                            </div>
                        </div>
                        {this.state.colorscaleType === 'cubehelix' &&
                        <div>
                           <div className='noWrap inlineBlock'>
                               <span className='textLabel spaceRight'>Start: </span>
                               <span className='textLabel spaceRight'>{this.state.cubehelix.start}</span>
                               <input
                                   type="range"
                                   min="0"
                                   max="300"
                                   step="1"
                                   value={this.state.cubehelix.start}
                                   className="slider spaceRightZeroTop"
                                   onMouseUp={this.updateCubehelixStart}
                               />
                           </div>
                           <div className='noWrap inlineBlock'>
                               <span className='textLabel spaceRight'>Rotations: </span>
                               <span className='textLabel spaceRight'>{this.state.cubehelix.rotations}</span>
                               <input
                                   type="range"
                                   min="-1.5"
                                   max="1.5"
                                   step="0.1"
                                   value={this.state.cubehelix.rotations}
                                   className="slider spaceRightZeroTop"
                                   onMouseUp={this.updateCubehelixRotations}
                               />
                            </div>
                        </div>
                        }
                        <div className='colorscaleControlsRow'>
                           {COLORSCALE_TYPES.map((x,i) =>
                               <a
                                   key={i}
                                   style={x === this.state.colorscaleType ? {backgroundColor: '#2a3f5f'} : null}
                                   className='colorscaleButton'
                                   onClick={() => {this.setColorscaleType(x)}}
                               >
                                   {x}                  
                               </a>        
                           )}
                       </div>
                       <div>
                           {this.state.colorscaleType === 'custom' &&
                               <div className='colorscaleControlsRow'>
                                    <p className='textLabel zeroSpace'>
                                        Decimals between 0 and 1, or numbers between MIN and MAX of your data, separated by commas:
                                    </p>
                                    <input
                                        type='text'
                                        defaultValue={this.state.customBreakpoints.join(', ')} 
                                        onChange={this.updateBreakpointArray}
                                    />
                                    <p className='textLabel spaceTop'>
                                        {this.state.customBreakpoints.length-1} breakpoints: {this.state.customBreakpoints.join(' | ')}
                                    </p>
                               </div>
                           }
                       </div>
                    </div>
                </div>
                <div className='colorscalePickerBottomContainer'>
                    <p>
                        {COLORSCALE_DESCRIPTIONS[this.state.colorscaleType]}
                    </p>
                    <Colorscale
                        colorscale={this.state.colorscaleOnMount}
                        onClick={this.onClick}
                        label={'RESET'}
                        width={150}
                    />
                    {BREWER.hasOwnProperty(this.state.colorscaleType) && BREWER[this.state.colorscaleType].map((x, i) =>
                        <Colorscale
                            key={i}                            
                            onClick={this.onClick}
                            colorscale={chroma.brewer[x]}
                            label={x}
                        />
                    )}
                    {this.state.colorscaleType === 'cubehelix' && CUBEHELIX.map((x, i) =>
                        <Colorscale
                            key={i}                            
                            onClick={this.onClick}
                            colorscale={chroma.cubehelix()
                                        .start(x.start)
                                        .rotations(x.rotations)
                                        .gamma(DEFAULT_GAMMA)
                                        .lightness(DEFAULT_LIGHTNESS)
                                        .scale()
                                        .correctLightness()
                                        .colors(DEFAULT_NCOLORS)
                            }
                            label={`s${x.start} r${x.rotations}`}
                            start={x.start}
                            rot={x.rotations}
                        />
                    )}
                    {this.state.colorscaleType === 'cmocean' && Object.keys(CMOCEAN).map((x, i) =>
                        <Colorscale
                            key={i}                            
                            onClick={this.onClick}
                            colorscale={CMOCEAN[x]}
                            label={x}
                        />
                    )}
                    {this.state.colorscaleType === 'custom' &&
                        <Colorscale
                            onClick={this.onClick}
                            colorscale={chroma.scale(this.state.previousColorscale)
                                        .classes(this.state.customBreakpoints)
                                        .mode('lch')
                                        .colors(this.state.nSwatches)
                            }
                            maxWidth={200}
                            label='Preview (click to apply)'
                        />
                    }
                </div>
            </div>
        );
    }
}
