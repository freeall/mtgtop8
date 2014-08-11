# mtgtop8

Fetch data from http://mtgtop8.com. Useful to gather events and deck information.

## Usage

``` js
var mtg = require('mtgtop8');

// Get a list of events
mtg.standardEvents(1, function(err, events) {
	if (err) return console.error(err);

	// Get player results and decks about a specific event
	mtg.event(events[0].id, function(err, event) {
		if (err) return console.error(err);

		console.log(event);
	});
});
```

## Methods

### standardEvents([page,] callback)

Fetches a list of standard events. The data is taken from this page http://mtgtop8.com/format?f=ST.

Example
``` js
mtg.standardEvents(function(err, events) {
	console.log(events);
});
/*
	[
		{
			title: 'MTGO Standard Daily (#7332921)',
			id: 7956,
			stars: 1,
			bigstars: 0,
			date: Tue Aug 05 2014 00:00:00 GMT+0200 (CEST) },
		...
	]
*/
```

### eventInfo(eventId, callback)

Fetches meta information about an event. Gives less data than `.event()` but is faster.

Example
``` js
mtg.eventInfo(7956, function(err, event) {
	console.log(event);
});
/*
	{
		title: 'Starcitygames Open Series: Dallas',
		format: 'Standard',
		stars: 3,
		bigstars: 0,
		players: 733,
		date: Sat Aug 02 2014 00:00:00 GMT+0200 (CEST),
		decks: [
			{
				result: '1',
				title: 'Devotion to Blue',
				player: 'Collin Rountree',
				id: 245741
			},
			...
			{
				result: '3/4', // Often a result will be like 3/4 or 5/8 if several players share ranking
				title: 'Devotion to Blue',
				player: 'Jake Peralez',
				id: 245738
			},
			...
		]
	}
*/
```

### event(eventId, callback)

Fetches meta information about an event aswell as all the decks. Takes longer than `.eventInfo()` but gets all decks data.

Example
``` js
mtg.event(7956, function(err, event) {
	console.log(event);
});
/*
	{
		title: 'MTGO Standard Daily (#7332921)',
		format: 'Standard',
		stars: 1,
		bigstars: 0,
		players: 8,
		date: '2014-08-04T22:00:00.000Z',
		decks: [
			{
				result: '1',
				title: 'Devotion to Green',
				player: 'shokushu',
				id: 245797,
				cards: [
					{
						count: 9,
						name: 'Forest'
					},
					{
						count: 4,
						name: 'Nykthos, Shrine to Nyx'
					},
					...
				],
				sideboard: [
					{
						count: 1,
						name: 'Scavenging Ooze'
					},
					...
				]
			...
		]
	}
*/
```

### deck(eventId, deckId, callback)

Fetches some meta information about a deck as well as the cards in it.

Example
``` js
mtg.deck(7956, 245797, function(err, deck) {
	console.log(deck);
});
/*
	{
		player: 'shokushu',
		result: '1',
		cards: [ 
			{ 
				count: 9,
				name: 'Forest'
			},
			...
		],
		sideboard: [
			{
				count: 1,
				name: 'Scavenging Ooze'
			},
			...
		]
	}
*/
```

## License

MIT