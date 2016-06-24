import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, hashHistory, IndexRoute } from 'react-router';

import App from './components/App';
import Home from './components/home';
import Person from './components/person';
import Persons from './components/persons';

window.React = React;
window.Events = new THREE.EventDispatcher();

const history = hashHistory;

render(
	(
		<Router history={history}>
			<Route path="/" component={Home}>
				<IndexRoute component={Persons} />
				<Route path="/:person" component={Person} />
			</Route>
		</Router>
	), document.getElementById('content')
);
