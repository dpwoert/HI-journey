import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

export default class Persons extends Component {

	constructor(props) {
		super(props);
		this.state = { active: false };
	}


	componentWillMount(){

	}

	click(person){

		window.Events.dispatchEvent({type: 'selectPerson', message: person })

	}

	render() {

		window.Events.dispatchEvent({type: 'selectPerson', message: false });

		let persons = this.props.persons.sort((a,b) => {
			return (a.hd && !b.hd) ? -1 : 1;
		});

		if(this.props.params.city){
			persons = persons.filter((a) => {

				if(a.after.length === 0){
					return false;
				}

				var lastCity = a.after[a.after.length - 1].name;
				lastCity = lastCity.replace(/ /g, '-').toLowerCase();

				if(lastCity === this.props.params.city){
					return true;
				}

				return false;
			});
		}

		return (
			<div className="persons__grid">
				{persons.map((person, i) => {
					var bg = {};
					var item = "persons__grid__item";
					var url = '/@/' + person.slug;

					if(this.state.active === person['last_name']){
						item += " active";
					}

					bg.backgroundImage = person.instagramPic ? 'url(' + person.instagramPic + ')' : '';
					return (
						<Link to={url} className={item} key={i} style={bg}>
							<div className="persons__grid__overlay" />
							<div className="persons__grid__name">{person['first_name']} {person['last_name']}</div>
						</Link>
					);
				})}
			</div>
		);
	}
}
