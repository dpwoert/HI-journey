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
				<ul className="home__legend">
					<li>before hyper <span style={{background: '#04cdae' }} /></li>
					<li>after hyper <span style={{background: '#f33f00' }} /></li>
				</ul>

				<div className="persons__container">

					{this.props.children}

				</div>

			</div>
		);
	}
}
