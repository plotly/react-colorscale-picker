/* global Plotly:true */

import React, {Component} from 'react';

import {Colorscale} from 'react-colorscales';
import ColorscalePicker from 'react-colorscales';

import {clone} from 'ramda'
import createPlotlyComponent from 'react-plotly.js/factory'

import pie from './plots/pie.json';
import map from './plots/map.json';
import line from './plots/line.json';

import './App.css';

const Plot = createPlotlyComponent(Plotly);

// Use "Viridis" as the default scale
const DEFAULT_SCALE = ["#fafa6e", "#9cdf7c", "#4abd8c", "#00968e", "#106e7c", "#2a4858"];

class App extends Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.toggleColorscalePicker = this.toggleColorscalePicker.bind(this);
        this.switchChartType = this.switchChartType.bind(this);
        this.recolorData = this.recolorData.bind(this);

        this.state = {
            showColorscalePicker: false,
            colorscale: DEFAULT_SCALE,
            data: pie.data,
            layout: pie.layout,
            plotType: 'pie'
        };
    }

    recolorData = (dataToRecolor, colorscale, plotType) => {
        let data = clone(dataToRecolor);
        
        if (plotType === 'pie') {
            data[0].marker = {colors: colorscale};
        }
        else if (plotType === 'map') {
            const plotlyColorscale = colorscale.map((x,i) => {return [i/(colorscale.length-1), x]});
            data[0].marker.colorscale = plotlyColorscale;
        }
        else if (plotType === 'line') {
            for (let i=0; i<colorscale.length; i++) {
                if (i < data.length) {
                    data[i].line.color = colorscale[i];
                }
            }
        }
        return data;
    }

    switchChartType = event => {
        const type = event.target.value;
        let data = pie.data;
        let layout = pie.layout;
        if (type === 'map') {
            data = map.data;
            layout = map.layout;
        }
        else if (type === 'line') {
            data = line.data;
            layout = line.layout;
        }
        this.setState({
            data: this.recolorData(data, this.state.colorscale, type),
            layout: layout,
            plotType: type
        });
    }

    onChange = colorscale => {

        const data = this.recolorData(this.state.data, colorscale, this.state.plotType);

        this.setState({
            data: data,
            colorscale: colorscale
        });
    }

    toggleColorscalePicker = () => {
        this.setState({showColorscalePicker: !this.state.showColorscalePicker});
    }

    render() {
        let toggleButtonStyle = {};
        if (this.state.showColorscalePicker) {
            toggleButtonStyle = {borderColor: '#A2B1C6'};
        }
        return (
            <div className="App">
                <div 
                    onClick={this.toggleColorscalePicker}
                    className='toggleButton'
                    style={toggleButtonStyle}
                >
                    <Colorscale
                        colorscale={this.state.colorscale}
                        onClick={() => {}}
                        width={150}
                    />
                    Toggle Colorscale Picker
                </div>
                <div style={{position:'absolute', top:'5px', left:'240px'}}>
                    <select onChange={this.switchChartType} value={this.state.plotType}>
                        <option value='pie'>Pie chart</option>
                        <option value='map'>Scatter map</option>
                        <option value='line'>Line chart</option>
                    </select>
                </div>
                {this.state.showColorscalePicker &&
                    <ColorscalePicker 
                        onChange={this.onChange}
                        colorscale={this.state.colorscale}
                    />
                }
                <div className='plotContainer'>
                    <Plot
                        data={this.state.data}
                        layout={this.state.layout}
                    />
                </div>
                <div className='textContainer'>
                    <h4>Colorscale as text array:</h4>
                    <p>
                        {JSON.stringify(this.state.colorscale)}
                    </p>
                </div>
            </div>
        );
    }
}

export default App;
