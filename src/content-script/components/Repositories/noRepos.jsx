/** @jsx h */
import { h } from 'preact';

export default function NoRepos(props) {
	return (
		<main className="noRepos">
			<div className="justifier">
				<h3>No repositories added</h3>
				<p>
					Navigate to a Github-repository you want to monitor and add the
					repository from the{' '}
					<a href="#" onClick={props.onToggleSettings}>
						settings page
					</a>
					.
				</p>
			</div>
		</main>
	);
}
