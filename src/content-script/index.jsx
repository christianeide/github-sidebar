import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.scss';
import App from './app.jsx';

const id = 'github-sidebar';
if (!document.getElementById(id)) {
	const appendDiv = document.createElement('div');
	appendDiv.id = id;
	document.body.appendChild(appendDiv);
}

ReactDOM.render(<App />, document.getElementById(id));
