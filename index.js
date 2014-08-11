var req = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var iconv = require('iconv-lite');

req = req.defaults({
	encoding: null
});

var fetchDeck = function(eventId, deckId, callback) {
	req('http://mtgtop8.com/event?e='+eventId+'&d='+deckId, function(err, res) {
		if (err) return callback(err);

		var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
		var result = { 
			player: $('table .chosen_tr [align=right] .topic').text().trim(),
			result: $('table .chosen_tr [align=center]').text().trim(),
			cards:[],
			sideboard:[]
		};

		var addCards = function(arr) {
			return function(i, card) {
				var parent = $(card).parent();
				$(card).remove();

				var name = $(card).text().trim();
				var count = parseInt($(parent).text().trim());
				arr.push({
					count: count,
					name: name
				});
			}
		};

		var tables = $('table table table');
		$('tr td div span', tables.last()).each(addCards(result.sideboard));
		tables.slice(0,-1).each(function(i, table) {
			$('tr td div span', table).each(addCards(result.cards));
		});

		// An check to make sure that it's being noticed if a deck is empty. Not too sure that the method above is always working for older data.
		if (!result.cards.length) console.log('[mtgtop8] It appears that this deck is empty, should be investigated. .event('+eventId+','+deckId+')');

		callback(null, result);
	});
};

var fetchEventInfo = function(eventId, callback) {
	req('http://mtgtop8.com/event?e='+eventId, function(err, res) {
		if (err) return callback(err);

		var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
		
		var players;
		var date;
		var data = $('table div table td[align=center] div')[1].prev.data.trim();
		var playersRE = /^(\d*) players/;
		var dateRE = /(\d\d\/\d\d\/\d\d)$/;
		if (data.match(playersRE)) players = parseInt(data.match(playersRE)[1]);
		if (data.match(dateRE)) date = data.match(dateRE)[1];

		var result = {
			title: $('.w_title td').first().text(),
			format: $('table div table td[align=center] div')[0].prev.data.trim(),
			stars: $('table div table td[align=center] div img[src="graph/star.png"]').length,
			bigstars: $('table div table td[align=center] div img[src="graph/bigstar.png"]').length,
			players: players,
			date: moment(date, 'DD/MM/YY').toDate(),
			decks: []
		};
		$('table td[width="25%"] > div > div:not([align="center"])').each(function(i, div) {
			var link = $($('div div a', div)[0]).attr('href');

			result.decks.push({
				result: $('div div[align=center]', div).text().trim(),
				title: $($('div div a', div)[0]).text().trim(),
				player: $($('div div a', div)[1]).text().trim(),
				id: parseInt(link.match(/\&d\=(\d*)/)[1])
			});
		});

		result.players = result.players || result.decks.length;

		callback(null, result);
	});
};

var fetchEvent = function(eventId, callback) {
	fetchEventInfo(eventId, function(err, event) {
		if (err) return callback(err);

		var decksFull = [];

		var onend = function() {
			event.decks = decksFull;
			callback(null, event);
		};
		(function next() {
			var deck = event.decks.shift();
			if (!deck) return onend();

			fetchDeck(eventId, deck.id, function(err, deckFull) {
				if (err) return callback(err);

				deck.cards = deckFull.cards;
				deck.sideboard = deckFull.sideboard;
				decksFull.push(deck);
				next();
			});
		})();
	});
};

var fetchStandardEvents = function(page, callback) {
	if (arguments.length === 1) return fetchStandardEvents(1, page);

	req.post('http://mtgtop8.com/format?f=ST&meta=52', { form:{ cp:page } }, function(err, res) {
		if (err) return callback(err);

		var result = [];

		var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));

		var table = $('div div table tr td[width="40%"] > table').eq(1);
		$('tr[height="30"]', table).each(function(i, div) {
			var link = $('td a', div).attr('href');
			var date = $('td[align="right"]', div).text();

			result.push({
				title: $('td a', div).text(),
				id: parseInt(link.match(/e\=(\d*)/)[1]),
				stars: $('td[width="15%"] img[src="graph/star.png"]', div).length,
				bigstars: $('td[width="15%"] img[src="graph/bigstar.png"]', div).length,
				date: moment(date, 'DD/MM/YY').toDate()
			});
		});

		callback(null, result);
	});
};

module.exports = {
	standardEvents: fetchStandardEvents,
	eventInfo: fetchEventInfo,
	event: fetchEvent,
	deck: fetchDeck
};