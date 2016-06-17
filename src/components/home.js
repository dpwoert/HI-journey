import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';


export default class Home extends Component {

	componentDidMount(){

		this.element = ReactDOM.findDOMNode(this);
		this.world = new World(this.element);


	}

	render() {

		return (
			<div className="home--container">

				<div className="canvas"/>

			</div>
		);
	}
}
