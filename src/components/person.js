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

		window.Events.dispatchEvent({type: 'selectPerson', message: person });

		if(!person.before){
			return false;
		}

		var after = person.after.filter((p, i) => {
			return !(p.name === 'Manchester' && i === 0);
		});

		return (
			<div className="persons__container">

				<div className="person__image" style={image} />
				<Link to="/" className="person__close" />

				<h2 className="person__name">{person['first_name']} {person['last_name']}</h2>

				<ul className="person__social">
					<li><a target="_blank" href={'https://twitter.com/@' + person.twitter}>twitter</a></li>
					<li><a target="_blank" href={'https://www.linkedin.com/in/' + person.linkedin}>LinkedIn</a></li>
					<li><a target="_blank" href={'https://www.instagram.com/' + person.instagram}>instagram</a></li>
				</ul>

				<ul className="person__trip">
					{person.before.map((city, i) => {
						return <li className="before" key={i}><span className="circle" /><span className="line"/>{city.name}</li>
					})}
					<li className="middle"><span className="circle" /><span className="line"/>Manchester</li>
					{after.map((city, i) => {
						return <li className="after" key={i}><span className="circle" /><span className="line"/>{city.name}</li>
					})}
				</ul>

			</div>
		);
	}
}
