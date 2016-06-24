import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

export default class Person extends Component {

	componentDidMount(){


	}

	render() {

		const persons = this.props.persons;
		let person = {};
		persons.forEach((p) => {
			if(p.slug === this.props.params.person){
				person = p;
			}
		})

		let image = {};
		image.backgroundImage = person.instagramPic ? 'url(' + person.instagramPic + ')' : '';

		window.Events.dispatchEvent({type: 'selectPerson', message: person })

		return (
			<div className="persons__container">

				<div className="person__image" style={image} />
				<Link to="/" className="person__close" />

				<h2 className="person__name">{person['first_name']} {person['last_name']}</h2>

			</div>
		);
	}
}
