/*
* Author: 	Rick van Bork
* Std. nr.: 11990503
*
* Back end for a scatterplot generator taking four variables.
* {"country": "String", "x": integer, "y": integer, "continent": "String"}
*/

window.onload = function() {

	var margin = {top: 100, right: 200, bottom: 30, left: 40},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom,

	x = d3.scale.linear()
	    .range([0, width]),

	y = d3.scale.linear()
	    .range([height, 0]),

	color = d3.scale.category10(),

	xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom"),

	yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left"),

	// make svg element
	svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

	dataDotRadius = 3.5,

	// initiates tooltip
	tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-dataDotRadius * 9, 0])
		.html(function(d) { 
			return "<span \"class\" = \"tip\">" + d.country + "</span>";
		}),

	// initiates list tooltip
	tip2 = d3.tip()
		.attr('class', 'd3-tip2')
		.offset([-dataDotRadius, 0])
		.html(function(d) { 
			return "<li \"class\" = \"tip2\">GDP per capita: $" + (d.x).formatMoney(2, '.', ',') + "</li><li \"class\" = \"tip2\">CPIA score: " + d.y + "</li>";
		});

	// parses dataJSON.txt and extracts data
	d3.json("data_test.json", function(error, data) {

		if (error) throw error;

		// force to integers
		data.forEach(function(d) {
		    d.y = + d.y;
		    d.x = + d.x;
	  	});

		x.domain(d3.extent(data, function(d) { return d.x; })).nice();
	  	y.domain(d3.extent(data, function(d) { return d.y; })).nice();

	  	drawAxes();

		drawDots(data);

		drawLegend();

		drawTitle();
	});

	/*
	* Code by: Patrick Desjardins
	* url: https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
	*
	* Formats an integer to dollar notation
	*/
	Number.prototype.formatMoney = function(c, d, t){
		var n = this, 
		c = isNaN(c = Math.abs(c)) ? 2 : c, 
		d = d == undefined ? "." : d, 
		t = t == undefined ? "," : t, 
		s = n < 0 ? "-" : "", 
		i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
		j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};

	/*
	* Draws a color coded legend with the reference names
	* to the left of it.
	*/
	function drawLegend() {

		var legendDotRadius = 9,

		legend = svg.selectAll(".legend")
			.data(color.domain())
		    .enter().append("g")
		    .attr("class", "legend")
		    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

		legend.append("text")
			.attr("x", width + margin.right - legendDotRadius * 4)
			.attr("y", legendDotRadius)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d; });

		legend.append("circle")
			.attr("cx", width + margin.right - legendDotRadius * 2)
			.attr("cy", legendDotRadius)
			.attr("r", legendDotRadius)
			.style("fill", color)
			.on("mouseover", function(d) { 

				// format d (continent string) to replace spaces with . for select function
		    	d3.selectAll("." + d.replace(/ /g,"."))
		    		.transition()
		    		.duration(500)
		    		.attr("r", dataDotRadius * 4.5);
			})
			.on("mouseout", function(d) { 
		    	d3.selectAll("." + d.replace(/ /g,"."))
		    		.transition()
		    		.duration(500)
		    		.attr("r", dataDotRadius);
			});

	}

	/*
	* Draws the scatterplot dots geven a dataset with three variables:
	*	-x variable
	*	-y variable
	*	-third variable
	* The third variable is color graded using d3 methods
	*/
	function drawDots(data) {

		// append the dots
		var dotEnter = svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")

			// make dot continent classes for the legend mouseover feature
			.attr("class", function(d) { return "datacircle " + d.continent; })
			.attr("r", dataDotRadius)
			.attr("cx", function(d) { return x(d.x); })
			.attr("cy", function(d) { return y(d.y); })
			.style("fill", function(d) { return color(d.continent); })

			// onmouseover produces weird 'bouncing bug'
			.on("mouseover", function(d) {

				var dotSelect = d3.select(this);
				tipSelect = d3.select(".d3-tip");

				dotSelect.transition().duration(200)
					.attr("r", dataDotRadius * 9);

				tip.show(d);

				tipSelect.transition().duration(200)
					.style("background-color", dotSelect.style("fill"))

				// set new ground referece for tip
				var ground = parseInt(tipSelect.style("top"));

				// on second click make space for info lines
				dotSelect.on("click", function(d) { 

					tip2.show(d);

					var tipSelect2 = d3.select(".d3-tip2");

					tipOffset = -d3.select(".d3-tip2").node().getBoundingClientRect().height * 1.15;
					tipSelect.transition().duration(500)
						.style("top", ground + tipOffset + "px");

					tipSelect2.transition().duration(200)
						.style("border", "2px solid " + dotSelect.style("fill"))
						.style("opacity", 1.0);
				});

				// call the list tip
				dotSelect.call(tip2);
			})
			.on("mouseout", function(d){
				tip.hide(d);
				tip2.hide(d);
				d3.select(this)
					.transition()
					.duration(200)
					.attr("r", dataDotRadius);

				// remove the list items tooltip
				d3.selectAll(".dataList").remove();
			});

		// call the name tip
		dotEnter.call(tip);
	}

	/*
	* Draws the axes using d3 methods
	* formatting is done using CSS
	*/
	function drawAxes() {

		// append the x-axis element to the svg container
	  	svg.append("g")
	  		.attr("class", "x axis")

	  		// transform and translate to correct position
	  		.attr("transform", "translate(0," + height + ")")

	  		// call axis variabe coupled to the d3 axis method
	  		.call(xAxis)
	  		.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("GDP per capita (dollars)");

		// append the y-axis element to the svg container
		svg.append("g")
			.attr("class", "y axis")

			// call axis variabe coupled to the d3 axis method
			.call(yAxis)
			.append("text")
			.attr("class", "label")

			// transform to correct orientation
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Country Policy and Institutional Assessment (CPIA) score");
	}

	/*
	* Draws the title of the scatterplor
	* Due to the length of this particular title, it is splitted it up
	* into 2 seperate lines.
	*/
	function drawTitle() {

		// title line 1
		svg.append("text")
			.attr("id", "titleLine1")
			.attr("x", width / 2)
			.attr("y", 0 - margin.top / 2)
			.attr("text-anchor", "middle")
			.text("Country Policy and Institutional Assessment (CPIA) score")
			.attr("dy", "0em");

		// title line 2
		svg.append("text")
			.attr("id", "titleLine2")
			.attr("x", width / 2)
			.attr("y", 0 - margin.top / 2)
			.attr("text-anchor", "middle")
			.text("and Gross Domestic Product (GDP) per Capita, or Purchasing Power Parity (PPP)")
			.attr("dy", "1em");
	}
}