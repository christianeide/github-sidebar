import React from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.scss';
import App from './app.jsx';

const id = 'github-sidebar';
const rootRefKey = '__githubSidebarReactRoot__';
if (!document.getElementById(id)) {
	const appendDiv = document.createElement('div');
	appendDiv.id = id;
	document.body.appendChild(appendDiv);
}

const rootElement = document.getElementById(id);
const root = rootElement[rootRefKey] ?? createRoot(rootElement);
rootElement[rootRefKey] = root;
root.render(<App />);
