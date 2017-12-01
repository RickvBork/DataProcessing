/*
* Author: Rick van Bork
* Std. nr: 11990503
*
* Logic for drawing a multiline graph using d3.
*
* Lots of room for improvement, like in updateFocus(). No need to redo all
* focus elements.
* Not enough time to fully finish the project, but it is functional.
*/

'use strict';

// set variables that can be set without DOM access
var colors = ['#000099', '#0099ff', '#0000ff'],

svg, g,

margin = {top: 100, right: 110, bottom: 50, left: 50},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,

x = d3.scaleTime()
	.rangeRound([0, width]),

y = d3.scaleLinear()
	.rangeRound([height, 0]),

line = d3.line().curve(d3.curveBasis)
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); }),

parseTime = d3.timeParse('%Y%m%d'),
bisectDate = d3.bisector(function(d) { return d.x; }).left,

// keep track of previous viewings of graphs
previousViews = [];

// load the DOM and d3 second
window.onload = function() {

	svg = d3.select('body')
		.insert('svg', ':first-child')
			.attr('width', 960)
			.attr('height', 500);

	g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	d3.json('data_KNMI_.json', function(error, data) {
		if (error) {
			alert('An error has ocurred while loading the data.')
		};

		// make a dropdown for the user to choose from stations.
		makeDropdown(data);

		buildFirstGraph(data);
	});
};

/*
* Updates the graph after new dataset has been chosen.
*/
function updateGraph(data, station) {

	makeTitle(station);

	var datasets = data[station];

	// prevent double date and int formatting
	if (previousViews.includes(station) == false) {
		forceValue(datasets);
		previousViews.push(station);
	};

	// scale the y axis again for new dataset
	y.domain([
		d3.min(datasets['Minimum'], function(d) { return d.y; }),
		d3.max(datasets['Maximum'], function(d) { return d.y; })
	]).nice();

    // Select the section we want to apply our changes to
    var svg = d3.select('body').transition();

    for (var set in datasets) {
		svg.selectAll('.line.' + set)
			.duration(750)
			.attr('d', line(datasets[set]));
	};

	// update yAxis
	svg.select('.yAxis')
		.duration(750)
		.call(d3.axisLeft(y));

	updateFocus(datasets);
};

/*
* Builds the first graph in the dataset.
*/
function buildFirstGraph(data) {

	// draw first graph with first station in data
	var firstStation = Object.keys(data)[0],
	datasets = data[firstStation];
	makeTitle(firstStation);

	// get sets for the legend
	var sets = [];
	for (var set in datasets) {
		sets.push(set);
	};
	drawLegend(sets);

	// force data to correct type
	forceValue(datasets);

	// push viewed station to list
	previousViews.push(firstStation);

	// scale all datasets to fit in graph area
	x.domain(d3.extent(datasets['Minimum'], function(d) { 
		return d.x; 
	})).nice();

	y.domain([
		d3.min(datasets['Minimum'], function(d) { return d.y; }),
		d3.max(datasets['Maximum'], function(d) { return d.y; })
	]).nice();

	// draw the axis
	makeAxis();

	// draw the graph lines
	makeLines(datasets);

	// draw the dots and lines following the mouse along the x-axis
	updateFocus(datasets);
};

/*
* Forces data to correct types.
*/
function forceValue(d) {
	for (var set in d) {
		d[set].forEach(function(d) {
			d.x = parseTime(d.x);
			d.y = (+ d.y) / 10;
		});
	};
};

/*
* Makes the dropdown menu.
*/
function makeDropdown(data) {

	var stations = [];

	for (var station in data) {
		stations.push(station);
	};

	// make dropdown
	var select = d3.select('body')
		.insert('select',':first-child')
			.attr('class','select')
			.on('change', onchange)

	// make options from data
	var options = select
		.selectAll('option')
		.data(stations).enter()
		.append('option')
			.text(function (d) { return d; });

	// when an option is clicked
	function onchange() {
		var selectStation = d3.select('select').property('value');

		updateGraph(data, selectStation);
	};
};

/*
* Makes the x and y-axis formatted for the datatypes.
*/
function makeAxis() {
	g.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(x))
		.select('.domain');

	g.append('g')
		.attr('class', 'yAxis')
		.call(d3.axisLeft(y))
		.append('text')
			.attr('fill', '#000')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '0.71em')
			.attr('text-anchor', 'end')
			.text('Temperature in ' + '\u2103');
};

/*
* Makes the lines.
*/
function makeLines(d) {

	var i = 0;
	for (var set in d) {
		g.append('path')
			.datum(d[set])
			.attr('class', 'line ' + set)
			.attr('fill', 'none')
			.attr('stroke', colors[i])
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('stroke-width', 1.5)
			.attr('d', line);
		i++;
	};
	if (i > colors.length) {
		console.log('Add extra color for colors to color array');
	}
};

/*
* Makes the title.
*/
function makeTitle(s) {
	
	// remove previous title
	d3.selectAll('.title').remove();

	// append to child g of svg element
	var titleEnter = d3.select('svg').select('g'),
		centerWidth = width / 2,
		centerHeight = - margin.top / 2


	titleEnter.append('text')
			.attr('class', 'title')
		.text('Average, minimum and maximum temperature per day.')
			.attr('text-anchor', 'middle')
			.attr('x', centerWidth)
			.attr('y', centerHeight)

	// two lines for readability of title
	titleEnter.append('text')
			.attr('class', 'title')
		.text('Registered by KNMI station: ' + s)
			.attr('text-anchor', 'middle')
			.attr('x', centerWidth)
			.attr('y', centerHeight)
			.attr('dy', '1.2em');
};

/*
* Draws the dots following the cursor along the x-axis while
* keeping track of the value of the y-axis for said x value.
* Also draws three y-lines and an x-line following the dots.
*
* Framework from: https://bl.ocks.org/mbostock/3902569
*/
function updateFocus(datasets) {

	// remove all focus elements
	d3.selectAll('.focus').remove();

	// fill none breaks mouse tracker
	svg.append('rect')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('class', 'focus')
		.attr('width', width)
		.attr('height', height)
		.attr('opacity', 0)
		.on('mouseover', function() { focus.style('display', null); })
		.on('mouseout', function() { focus.style('display', 'none'); })
		.on('mousemove', mousemove);

	// set the sets for the focus dots and lines classes
	var sets = ['Average', 'Minimum', 'Maximum'];

   	var focus = g.append('g')
			.attr('class', 'focus')
			.style('display', 'none');

		// x1, y1 startingpoints, x2, y2 end points
	focus.append('line')
		.attr('class', 'x-hover-line hover-line')
		.attr('y1', height)
			.attr('y2', 0);

	focus.selectAll('.y-hover-line')
		.data(sets).enter()
		.append('line')
			.attr('class', function(d) { return 'y-hover-line ' + d; })
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', 0);
	
	focus.selectAll('.circle')
		.data(sets).enter()
		.append('circle')
			.attr('class', function(d) { return 'circle ' + d; })
			.attr('r', 7.5);

	focus.selectAll('.tempText')
		.data(sets).enter()
		.append('text')
			.attr('class', function(d) { return 'tempText ' + d; })
			.attr('dy', '.31em');

	focus.selectAll('.dateText')
		.data(sets).enter()
		.append('text')
			.attr('class', function(d) { return 'dateText ' + d; })
			.attr('y', height)
			.attr('dy', '-.5em');

	/*
	* logic for the lines and dots following the mouse.
	*/
	function mousemove() {
		var formatDate = d3.timeFormat('%d %b (%Y)');

		var x0 = x.invert(d3.mouse(this)[0]);

		for (var set in datasets) {
			var i = bisectDate(datasets[set], x0, 1),
			d0 = datasets[set][i - 1],
			d1 = datasets[set][i],
			d = x0 - d0.x > d1.x - x0 ? d1 : d0;

			// selected coordinates for a datapoint in a given set
			var xCoordinate = x(d.x),
				yCoordinate = y(d.y),

			setColor = d3.select('.line.' + set).attr('stroke');

			// for every circle, give correct positions
			focus.select('.circle.' + set)
				.attr('cx', xCoordinate)
				.attr('cy',	yCoordinate)
				.style('fill', setColor);

			// for every text element, display text next to circle
			focus.select('.tempText.' + set)
				.attr('x', xCoordinate + 15)
				.attr('y', yCoordinate)
				.text(function() { return d.y + '\u2103'; });

			focus.select('.dateText.' + set)
				.attr('x', xCoordinate + 15)
				.text(function() { return formatDate(d.x); });

			// only draw the x hover line once, y up to max value
			if (set == 'Maximum') {
				focus.select('.x-hover-line')
					.attr('y2', yCoordinate)
					.attr('x1', xCoordinate)
					.attr('x2', xCoordinate)
					.style('stroke-dasharray', ('3, 3'))
					.attr('stroke-width', 2)
					.attr('stroke', setColor);
			};

			// draws the y hover line up to the data dot
			focus.select('.y-hover-line.' + set)
				.attr('y1', yCoordinate)
				.attr('y2', yCoordinate)
				.attr('x2', xCoordinate)
				.style('stroke-dasharray', ('3, 3'))
				.attr('stroke-width', 2)
				.attr('stroke', setColor);
		};
  	};
};

/*
* Draws the legend.
*
* Framework from: https://bl.ocks.org/mbostock/3887118
*/
function drawLegend(d) {

	var legend = svg.selectAll('.legend')
		.data(d)
		.enter().append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i) { 
			return 'translate(0,' + i * 20 + ')'; 
		});

	legend.append('text')
		.attr('x', width + margin.right + margin.left)
		.attr('y', 9)
		.attr('dy', '.35em')
		.style('text-anchor', 'end')
		.text(function(d) { return d; });

	legend.append('rect')
		.attr('x', width + margin.right - 40)
		.attr('width', 18)
		.attr('height', 18)
		.style('fill', function(d, i) { return colors[i]; });
};