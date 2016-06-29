import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

export default class Home extends Component {

	constructor(props) {
		super(props);
		this.state = { persons: [] };
	}

	componentDidMount(){

		this.element = ReactDOM.findDOMNode(this);
		this.world = new World(this.element);

	}

	componentWillMount(){

		d3
			.json('data/data.json',(error, rows) => {

				rows = shuffle(rows);
				rows = rows.sort((a,b) => {
					return a.hd && !b.hd ? 1 : -1;
				})

				this.setState({
					persons: shuffle(rows)
				});

			});

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

					{ React.cloneElement(this.props.children, {persons: this.state.persons}) }

					<ul className="persons__tabs">
						<li className="persons__tab--person"><Link to="/"><img src="images/face.svg"/> list</Link></li>
						<li className="persons__tab--city"><Link to="/cities"><img src="images/city.svg"/> cities</Link></li>
					</ul>

				</div>

			</div>
		);
	}
}
