import React from 'react';
import Icons from '../../images/svgs/icons.js';
import { ago } from '../../utils/time.js';

export default class Errors extends React.Component {
	constructor() {
		super();

		this.state = {
			showErrors: false,
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.state.showErrors !== nextState.showErrors) {
			return true;
		} else if (this.props.errors === nextProps.errors) {
			return false;
		}
		return true;
	}

	errorList = (errors) => {
		return (
			<ul>
				{errors.map((element, index) => {
					return (
						<li className="listItem" key={`${element.title}_${index}`}>
							<h5>{element.title}</h5>
							<p>
								{element.message} <i>({ago(element.time)} ago)</i>
							</p>
						</li>
					);
				})}
			</ul>
		);
	};

	handleErrors = () => {
		this.setState({ showErrors: !this.state.showErrors }, () => {
			// After the user hides errorview, we remove errors
			// See no reason to use time and screenposition
			// for displaying errors to users
			if (!this.state.showErrors) {
				this.props.sendToBackend({ type: 'clearErrors' });
			}
		});
	};

	render() {
		const { errors } = this.props;

		if (errors.length === 0) {
			return null;
		}

		return (
			<div className="error">
				<a href="#" className="warningBtn" onClick={this.handleErrors}>
					<Icons icon="error" />
				</a>

				{this.state.showErrors && this.errorList(errors)}
			</div>
		);
	}
}
