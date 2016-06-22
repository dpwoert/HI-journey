import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';


export default class Persons extends Component {

	constructor(props) {
		super(props);
		this.state = { persons: [] };
	}


	componentWillMount(){

		d3
			.json('data/data.json',(error, rows) => {

				console.log('data loaded', rows);

				this.setState({
					persons: rows
				});

			});

	}

	render() {

		return (
			<div className="persons__grid">
				{this.state.persons.map(function(person, i){
					var bg = {}
					bg.backgroundImage = person.instagramPic ? 'url(' + person.instagramPic + ')' : '';
					return (
						<div className="persons__grid__item" key={i} style={bg}>
							<div className="persons__grid__name">{person['first_name']} {person['last_name']}</div>
						</div>
					);
				})}
			</div>
		);
	}
}
