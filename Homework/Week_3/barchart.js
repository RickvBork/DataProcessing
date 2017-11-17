/*
* formats the data in months
*/
function dataFormatter(unformattedDataDict) {

	// bugfixing
	console.log(unformattedDataDict)

	// initiate data list
	var formattedDataList = [];

	// nnon leap year month dict
	monthDict = {'01': 31, '02': 28, '03': 31, '04': 30, '05': 31, '06': 30, 
	'07': 31,'08': 31, '09': 30, '10': 31, '11': 30, '12': 31};

	months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
	length = months.length;

	// change all rain value strings in ints
	for (var i = 0; i < unformattedDataDict['date'].length; i++) {
		unformattedDataDict['precipitation'][i] = parseInt(unformattedDataDict['precipitation'][i])
	}

	var days = 0;
	for (var i = 0; i < length; i++) {

		if (i < 9) {
			var newMonth = '0' + (i + 1);
		}
		else {
			var newMonth = i + 1;
		}

		monthList = unformattedDataDict['precipitation'].slice(days, days + monthDict[newMonth]);

		var result = monthList.reduce(function(accumulator, currentValue) {
		    return accumulator + currentValue;
		});
		formattedDataList.push(result);

		days += monthDict[newMonth];
	}

	var maxValue = d3.max(formattedDataList);

	// make list of dicts
	formattedData = [];
	for (var i = 0; i < length; i++) {
		formattedData.push({'month': months[i], 'value': formattedDataList[i]})
	}

	return [maxValue, formattedData];
}

/*
* draws the axes of the barchart
*/
function drawAxes(chart) {
   
   // draw x-axis in middle of chart margins
   chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("x", (width + margin.left) / 2)
    .attr("y", margin.bottom)
    .style("text-anchor", "end")
    .text("Time of year in months");

  // draw y-axis with rotated text
  chart.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", - margin.left)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Precipitation in 0.1 hours");
}

/*
* draws the bars of the chart
*/
function drawBars(chart, data) {
  
  // enter SVG rectangles as bars
  rectEnter = chart.selectAll(".bar").data(data).enter()
    .append('rect')
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.month); })
    .attr("y", function(d) { return y(d.value); })
    .attr('height', function(d) { return height - y(d.value); })
    .attr('width', x.rangeBand())

    // show tooltip on mouseover
    .on("mouseover", function(d){
      tip.show(d);
      d3.select(this).style("fill", "darkblue");
    
    // hide tooltip on mouseout
    }).on("mouseout", function(d){
      tip.hide(d);
      d3.select(this).style("fill", "cornflowerblue");
    });

  // call the tip
  rectEnter.call(tip);
}

/*
* Builds the bar chart by first defining range and domain,
* then it draws the axes
*/
function buildBarchart(data) {

  // seperate data values
  data = data[1];

  // sets domain of the x-axis
  x.domain(data.map(function(d) { return d.month; }));

  // sets the domain of the y-axis
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  // enter chart tag with correct width and height
  var chart = d3.select('body').select('.chart')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  // offset chart 'area' with margins
  .append("g")

  // right, bottom shift by the margin dimensions
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  drawAxes(chart);

  drawBars(chart, data);
}

// scale for the chart
scale = 0.5;

// width and height with margins accounted for
var margin = {top: 20, right: 30, bottom: 50, left: 80},
    width = scale * (960 - margin.left - margin.right),
    height = scale * (500 - margin.top - margin.bottom);

// makes x-range bounds with ordinal data values
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

// makes y-range
var y = d3.scale.linear()
    .range([height, 0]);

// use axis method to access standard axis format
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// use axis method to access standard axis format
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

// initiates tooltip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .html(function(d) { 
    return "<span>" + d.value / 10 + " hours of Precipitation in " + d.month + "</span>";
  })

// parses dataJSON.txt and extracts data
d3.json("dataJSON.txt", function(data) {
  buildBarchart(dataFormatter(data)); 
});
