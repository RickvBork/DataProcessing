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
var colors = ['#000099', '#0000ff', '#0099ff'],

sets, testStation, selectStation, d0, d1, chartData, barCoordinateDict,

parseTime = d3.timeParse('%Y%m%d'),
bisectDate = d3.bisector(function(d) { return d.x; }).left,

// keep track of previous viewings of graphs
previousViews = [],

barY, barHeight, gBar, barX0;

var currentIndex = 0;

// load the DOM and d3 second
window.onload = function() {

	d3.queue()
		.defer(d3.json, 'data_KNMI_2016_test.json')
		.defer(d3.json, 'data_KNMI_1963_test.json')
		.await(mainFunction);
};

/*
* Main Function
*/
function mainFunction(error, data2016, data1963) {

	if (error) throw error;

	selectStation = d3.keys(data2016)[0];

	// get sets for the legend
	sets = [];
	for (var set in data2016[selectStation]) {
		sets.push(set);
	};

	// force all values into correct types
	forceValue(data2016, data1963);

	// set datasets to global
	d0 = data1963;
	d1 = data2016;

	// make a barchart acceptable format
	formatBarchartData(d0, d1);
	buildFirstGraph(d1);
	buildFirstChart(d0, d1);
};

/*
* Builds the first graph in the dataset.
*/
function buildFirstGraph(data) {

	var svgWidth = 960,
	svgHeight = 500,

	svg = d3.select('body')
		.insert('svg', ':first-child')
			.attr('class', 'lineGraph')
			.attr('width', svgWidth)
			.attr('height', svgHeight),

	margin = {top: 100, right: 110, bottom: 50, left: 50},
	width = svgWidth - margin.left - margin.right,
	height = svgHeight - margin.top - margin.bottom,

	g = svg.append('g')
		.attr('class', 'transform')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),

	x = d3.scaleTime()
		.rangeRound([0, width]),

	y = d3.scaleLinear()
		.rangeRound([height, 0]),

	line = d3.line().curve(d3.curveBasis)
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });

	// make a dropdown for the user to choose from stations.
	makeDropdown(data);

	var	firstStation = d3.keys(data)[0];

	// draw first graph with first station in data
	var datasets = data[firstStation];


	var title0 = 'Average, minimum and maximum temperature per day.',
	title1 = 'Registered by KNMI station: '
	makeChartTitle(width, margin.top, '.lineGraph', title0, title1);

	drawLegend(sets);

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

	/*
	* Makes the dropdown menu.
	*/
	function makeDropdown(data) {

		var stations = getStations(data);

		// fill dropdown with stations
		d3.select('.dropdown-menu')
			.selectAll('dropdown-item')
				.data(stations).enter()
				.append('a')
				.attr('class', 'dropdown-item')
				.text(function(d) { return d; })
				.on('click', onchange);

		// when an option is clicked
		function onchange() {

			selectStation = d3.select(this).text();

			updateTitle();

			updateGraph(data, selectStation);

			updateChart(selectStation);

			/*
			* Updates the graph after new dataset has been chosen.
			*/
			function updateGraph(data, station) {

				// TODO:
				// var datasets = ds0

				var datasets = data[station];

				// scale the y axis again for new dataset
				y.domain([
					d3.min(datasets['Minimum'], function(d) { return d.y; }),
					d3.max(datasets['Maximum'], function(d) { return d.y; })
				]).nice();

			    // Select the graph
			    var svg = d3.select('.lineGraph').transition();

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

			barCoordinateDict = {}

			for (var set in datasets) {
				var i = bisectDate(datasets[set], x0, 1),
				d0 = datasets[set][i - 1],
				d1 = datasets[set][i],
				d = x0 - d0.x > d1.x - x0 ? d1 : d0;

				// get a dict with set keying a day from origin and value
				currentIndex = x0 - d0.x > d1.x - x0 ? i : i - 1;

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
			updateBarHeights(currentIndex);
	  	};
	};
};

/*
* Build the first barchart with the first station in the data.
* First station is global and chosen from the other dataset.
*/
function buildFirstChart(data2016, data1963) {

	// force 1963 data to correct types and notation
	var svgWidth = 960,
	svgHeight = 500,

	svg = d3.select('body')
		.insert('svg', ':first-child')
			.attr('class', 'barChart')
			.attr('width', svgWidth)
			.attr('height', svgHeight),

	margin = {top: 100, right: 110, bottom: 50, left: 50},
	width = svgWidth - margin.left - margin.right;

	barHeight = svgHeight - margin.top - margin.bottom;

	gBar = svg.append('g')
		.attr('class', 'transform')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var title0 = 'Selected Average, minimum and maximum temperature per day for 2016 and 1963.',
	title1 = 'Registered by KNMI station: '
	makeChartTitle(width, margin.top, '.barChart', title0, title1);

	drawLegend();

	function drawLegend() {

		var data = ["Maximum 2016", "1963", "Average 2016", "1963","Minimum 2016", "1963"];

		var legend = svg.selectAll('.bar.legend')
			.data(data)
			.enter().append('g')
			.attr('class', 'bar legend')
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
			.attr('x', width + margin.right - 80)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', function(d, i) { return colors[Math.floor(i * 0.5)]; })
			.style('fill-opacity', function(d, i) { return i % 2 == 0 ? 1 : 0.7});
	};

	barX0 = d3.scaleBand()
    	.rangeRound([0, width])
    	.paddingInner(0.1);

	var x1 = d3.scaleBand()
		.padding(0.05);

	barY = d3.scaleLinear()
		.rangeRound([barHeight, 0]);

	// for colors of one group of barcharts
	var z = d3.scaleOrdinal()
		.range(['#000099', '#0099ff']);

	// KEYS: ['2016', '1963']; the categories of the barchart
	var keys = ['2016', '1963'];

	// data: [{'type': 'Minimum', '2016': value, '1963': value}, {...}], 'columns': ['type', '2016', '1963']];

	// TODO:
	// data = ds0;
	var datasets2016 = d1[selectStation],
	datasets1963 = d0[selectStation];

	// var max = d3.max(datasets2016['Maximum'], function(d) { return d.y; }),
	// min = d3.min(datasets1963['Minimum'], function(d) { return d.y; });

	var temperatures = stationMinMax(datasets1963, datasets2016),

	min = temperatures.min, 
	max = temperatures.max;

	// set domains
	barX0.domain(sets.map(function(d) { return d; }));
	x1.domain(keys).rangeRound([0, barX0.bandwidth()]);
	barY.domain([min, max]);

	makeRects();

	gBar.append('g')
		.attr('transform', 'translate(0,' + barHeight + ')')
		.call(d3.axisBottom(barX0));

	gBar.append('g')
		.attr('class', 'chart yAxis')
		.call(d3.axisLeft(barY).ticks(null, 's'))
		.append('text')
			.attr('y', 6)
			.attr('dy', '0.71em')
			.attr('fill', '#000')
			.attr('text-anchor', 'end')
			.attr('transform', 'rotate(-90)')
			.text('Temperature in ' + '\u2103');

	/*
	* Build the groups of bars for the barchart
	*/
	function makeRects() {

		// colors where the first color is for 1963
		var barColors = {'Average': '#0000FF', 'Maximum': '#000099', 'Minimum': '#0099FF'};

		gBar.selectAll('g')
			.data(chartData)
			.enter().append('g')
			.attr('class', function(d) { return 'groups'; })
			.attr('id', function(d) { return 'group' + d.type; })
			.attr('transform', function(d) { return 'translate(' + barX0(d.type) + ',0)'; })
			.selectAll('rect')
			.data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })
			.enter().append('rect')
			.attr('class', function(d) { return 'bar a' + d.key; })
			.attr('id', function(d) { return 'bar' + d.key; })
			.attr('x', function(d) { return x1(d.key); })
			.attr('y', function(d) { return barY(d.value); })
			.attr('width', x1.bandwidth())
			.attr('height', function(d) { return barHeight - barY(d.value); })
			.append('g').append('text')
				.text('test')
					.attr("x", function(d) { return d3.select('.bar.a' + d.key).attr('x'); })
					.attr("y", function(d) { return d3.select('.bar.a' + d.key).attr('y'); })
					.attr("dy", ".35em")
					.text('test');

		// select colors
		for (var set in barColors) {
			var group = d3.select('#group' + set)

			group.selectAll('.bar')
				.attr('fill', function(d, i) { return barColors[set]})
				.style('fill-opacity', function(d, i) { return i == 0 ? 1 : 0.7 })
		};
	};
};

/*
* Force all data before drawing.
*/
function forceValue(d0, d1) {

	for (var station in d0) {
		for (var set in d0[station]) {
			
			// force first dataset into correct types
			d0[station][set].forEach(function(d) {
				d.x = parseTime(d.x);
				d.y = (+ d.y) / 10;
			});

			// force second dataset into correct types
			d1[station][set].forEach(function(d) {
				d.x = parseTime(d.x);
				d.y = (+ d.y) / 10;
			});
		};
	};
};

function formatBarchartData(d0, d1) {

	// take data of first station, first dataset
	var datasets1963 = d0[selectStation],
	datasets2016 = d1[selectStation];

	chartData = [];

	for (var i = 0; i < 3; i++) {
		chartData.push({'type': sets[i], '2016': datasets2016[sets[i]][0]['y'], '1963': datasets1963[sets[i]][0]['y']});
	};
};

/*
* Almost the same as the update y for the lineGraph.
*/
function updateChart(station) {

	// get min and max temperatures
	var temperatures = stationMinMax(d0[station], d1[station]),
	min = temperatures.min,
	max = temperatures.max;

	// set the new y domain
	barY.domain([min, max]);

	var svg = d3.select('.barChart').transition();

	// update yAxis
	svg.select('.chart.yAxis')
		.duration(750)
		.call(d3.axisLeft(barY));

	updateBarHeights(currentIndex);
};

/*
* Uses an index from the mouseover of the multi-line chart to select the data from both datasets and updates the height of the bars in the barchart.
*/
function updateBarHeights(index) {

	var data0 = d0[selectStation],
	data1 = d1[selectStation];

	for (var set in data0) {
		var v0 = data0[set][index]['y'],
		v1 = data1[set][index]['y'];

		// select the groups and set a transition
		var group = d3.selectAll('#group' + set).transition();

		// update the bar heights
		group.selectAll('#Bar1963')
			.duration(80)
			.attr('y', barY(v0))
			.attr('height', barHeight - barY(v0));
		group.selectAll('#Bar2016')
			.duration(80)
			.attr('y', barY(v1))
			.attr('height', barHeight - barY(v1));
	};
};

/*
* Fills a list with the stations found in the data.
*/
function getStations(data) {
	var stations = [];
	for (var station in data) {
		stations.push(station);
	};
	return stations;
};

/*
* Gets the minimum and maximum data for the y axis.
*/
function stationMinMax(ds0, ds1) {

	var max = d3.max(ds1['Maximum'], function(d) { return d.y; }),
	min = d3.min(ds0['Minimum'], function(d) { return d.y; });

	return { 'min': min, 'max': max };
};

function makeChartTitle(width, marginTop, select, string0, string1) {

	d3.select(select).select('title').remove();

	// append to child g of svg element
	var titleEnter = d3.select(select).selectAll('.transform'),
		centerWidth = width / 2,
		centerHeight = - marginTop / 2

	titleEnter.append('text')
			.attr('class', 'title')
		.text(string0)
			.attr('text-anchor', 'middle')
			.attr('x', centerWidth)
			.attr('y', centerHeight)

	// two lines for readability of title
	titleEnter.append('text')
			.attr('class', 'title station')
		.text(string1 + selectStation)
			.attr('text-anchor', 'middle')
			.attr('x', centerWidth)
			.attr('y', centerHeight)
			.attr('dy', '1.2em');
};

/*
* Sets selections for changing the title.
*/
function updateTitle() {

	var select0 = '.lineGraph',
	select1 = '.barChart';

	var selections = ['.lineGraph', '.barChart'];

	selections.forEach(function(d, i) { changeTitle(d); });
};

/*
* Changes the title strings.
*/
function changeTitle(s) {

	var lineTitle = d3.select(s).selectAll('.title.station');
	var lineText = lineTitle
		.text();

	var lineText = lineText.substr(0, lineText.indexOf(':')) + ': ';
	lineTitle.text(lineText + selectStation);

};