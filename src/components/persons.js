import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

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

export default class Persons extends Component {

	constructor(props) {
		super(props);
		this.state = { persons: [], active: false };
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

	click(person){

		const current = this.state.active;
		if(!current){

			this.setState({
				active: person['last_name']
			});
			window.Events.dispatchEvent({type: 'selectPerson', message: person })

		} else {

			this.setState({
				active: false
			});
			window.Events.dispatchEvent({type: 'selectPerson', message: false })

		}


	}

	render() {

		return (
			<div className="persons__grid">
				{this.state.persons.map((person, i) => {
					var bg = {};
					var item = "persons__grid__item";

					if(this.state.active === person['last_name']){
						item += " active";
					}

					bg.backgroundImage = person.instagramPic ? 'url(' + person.instagramPic + ')' : '';
					return (
						<div className={item} key={i} style={bg} onClick={this.click.bind(this, person)}>
							<div className="persons__grid__overlay" />
							<div className="persons__grid__name">{person['first_name']} {person['last_name']}</div>
						</div>
					);
				})}
			</div>
		);
	}
}
