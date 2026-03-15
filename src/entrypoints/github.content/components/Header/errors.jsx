import React, { useState } from 'react';
import Icons from '../../images/svgs/icons';
import { ago } from '../../utils/time.js';

export default function Errors({ errors, sendToBackend }) {
	const [showErrors, setShowErrors] = useState(false);

	const handleErrors = () => {
		const newShowErrors = !showErrors;
		setShowErrors(newShowErrors);

		// After the user hides errorview, we remove errors
		// See no reason to use time and screenposition
		// for displaying errors to users
		if (!newShowErrors) {
			sendToBackend({ type: 'clearErrors' });
		}
	};

	if (errors.length === 0) {
		return null;
	}

	return (
		<div className="error">
			<a href="#" className="warningBtn" onClick={handleErrors}>
				<Icons icon="error" />
			</a>

			{showErrors ? (
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
			) : null}
		</div>
	);
}
