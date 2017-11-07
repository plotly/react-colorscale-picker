import React, { Component } from 'react';
import logo from './logo.svg';
import ColorscalePicker from './components/ColorscalePicker.react.js';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange = colorscale => {
        console.log(colorscale);
    }

    render() {
        return (
            <div className="App">
                <ColorscalePicker onChange={this.onChange} />
            </div>
        );
    }
}

export default App;
