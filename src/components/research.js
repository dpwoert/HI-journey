import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

export default class Research extends Component {

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
		let persons = this.props.persons;
		persons = persons.filter((x) => {
			return x['IRP_topic'];
		});

		return (
			<div className="persons__grid">
				{persons.map((person, i) => {
					var bg = {};
					var item = "persons__grid__item persons__grid__item--research";
					var url = '/@/' + person.slug;

					if(this.state.active === person['last_name']){
						item += " active";
					}

					bg.backgroundImage = person.instagramPic ? 'url(' + person.instagramPic + ')' : '';

					return (
						<Link to={url} className={item} key={i}>
							<div className="persons__grid__image" style={bg} />
							<div className="persons__grid__name">{person['IRP_topic']}</div>
						</Link>
					);
				})}
			</div>
		);
	}
}
