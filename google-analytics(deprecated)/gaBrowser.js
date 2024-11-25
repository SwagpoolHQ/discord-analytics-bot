import debug from 'debug';

export default async function gaBrowser(measurementIds, eventsRawModel) {
	// 	console.log(props);
	// APP+WEB Endpoint
	const endPoint = 'https://www.google-analytics.com/g/collect';

	// Base Event Model for Web Hit
	const eventModel = {
		v: 2,
		tid: measurementIds, // => 'G-2RSPNCH2FD'
		_p: Math.round(2147483647 * Math.random()),
		//sr: screen.width + 'x' + screen.height,
		_dbg: 1,
		//ul: (navigator.language || "").toLowerCase(), 
		cid: '1908161148.1586721333',
		dl: 'https://discordlinks.com/gaBrowser - test',
		dr: 'https://apple.com',
		dt: 'gaBrowser - test',
		//sid: new Date() * 1,
		sid: '2223',
		_s: 1,
		//_nsi:  '2121', // Non-interactive
		_ss: 1,    // Session number in the current
		_fv: false,
		seg: '1',
	}

	// A queue to batch our events
	const events = [];

	// Let's push some events 
	events.push({
		'en': 'page_view'
	});
	/*
	
	// Second Event
	events.push({
		'en': 'scroll',
		'_et': '5000',
		'epn.percent_scrolled': '90'
	});
	// Another more event
	events.push({
		'en': 'useless_no_bounce_event',
		'_et': '5000',
		'ep.no_bounce_time': '5sec'
	});
	*/


	let requestBody;

	// Is there any event in our queue?
	if (events.length > 0) {
		// If there's only one event, we'll not pushing a body within our request
		if (events.length === 1) {
			Object.assign(eventModel, events[0]);
		} else {
			requestBody = events.map(function (e) {
				return (Object.keys(e).map(key => key + '=' + e[key]).join('&'));
			}).join("\n");
		}
		const requestQueryString = Object.keys(eventModel).map(key => key + '=' + encodeURIComponent(eventModel[key])).join('&');

		fetch(endPoint + '?' + requestQueryString, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-url	encoded"
			},
			body: requestBody || undefined
		}).then(() => console.log(endPoint + '?' + requestQueryString))
	}
}