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

		let cities = [];
		let now = [];

		this.props.persons.forEach((p) => {

			p.before.forEach((c) => {
				if(cities.indexOf(c.name) === -1){
					cities.push(c.name)
				}
			})

			p.after.forEach((c) => {
				if(cities.indexOf(c.name) === -1){
					cities.push(c.name)
				}
			});

			if(p.after.length > 0){
				now.push(p.after[p.after.length - 1].name);
			}

		});

		cities = cities.sort((a,b) => {
			return now.indexOf(a) === -1 && now.indexOf(b) > -1 ? 1 : -1;
		});

		return (
			<div className="persons__grid">
				{cities.map((city, i) => {
					var bg = {};
					var item = "persons__grid__item";
					var url = '/cities'
					const citySlug = city.replace(/ /g, '-').toLowerCase();

					if(now.indexOf(city) > -1){
						item += " active";
						url = '/city/' + citySlug;
					}

					bg.backgroundImage = 'url(images/cities/' + citySlug + '.jpg)';

					return (
						<Link to={url} className={item} key={i} style={bg}>
							<div className="persons__grid__overlay" />
							<div className="persons__grid__name">{city}</div>
						</Link>
					);
				})}
			</div>
		);
	}
}
