d3.xml("test.svg", "image/svg+xml", function(error, xml) {
    if (error) throw error;    
    document.body.appendChild(xml.documentElement);  

    var data = [
    	{"color": "#ccece6", "amount": 100}, 
    	{"color": "#99d8c9", "amount": 1000}, 
    	{"color": "#66c2a4", "amount": 10000}, 
    	{"color": "#41ae76", "amount": 100000}, 
    	{"color": "#238b45", "amount": 1000000}, 
    	{"color": "#005824", "amount": 10000000}, 
    	{"color": "#D3D3D3", "amount": "unknown data"}
    ]

    console.log(data[0].color)

    var yBegin = parseInt(document.getElementById("tekst4").getAttribute("y"))
    canvasHeight = document.getElementById("canvas").getAttribute("height"),
    tekstboxHeight = document.getElementById("tekst1").getAttribute("height"),
    legendAmount = data.length,
    trueSeperation = (canvasHeight - (tekstboxHeight * legendAmount)) / (legendAmount + 1),
    height = 29,
    widthColor = 21,
    widthText = 119.1,
    xColor = 13,
    xText = 46.5;

    // boxes are not equally seperated hence -3 to format the legend nicely...
    seperation = document.getElementById("tekst4").getAttribute("y") - document.getElementById("tekst3").getAttribute("y") - 3

    // select container for appending missing rect elements
    d3.select("body").select("svg").selectAll(".st1")
		.data(data).enter()
		.append("rect")

		// format color class with iterator
		.attr("id", function(d, i) { return "kleur" + (i + 1); })
		.attr("x", xColor)

		// begin with the y-coordinate of the 4th text element, and add seperation amount
		.attr("class","st1")
		.attr("width", widthColor)
		.attr("height", height)
		// .style("fill", function(d) { return d.color; });

	// select container for appending missing rect elements
	d3.select("body").select("svg").selectAll(".st2")
		.data(data).enter()
		.append("rect")
		.attr("id", function(d, i) { return "tekst" + (i + 1); })
		.attr("x", xText)
		.attr("class","st2")
		.attr("width", widthText)
		.attr("height", height);

	// select all st1 classes
	d3.selectAll(".st1").data(data)

		// for every st1 class element
		.each(function(d) { 

			// select the element
			d3.select(this)

			// fill with appropriate color
			.style("fill", d.color)
		});

	// make seperation better for color boxes
	d3.selectAll(".st1")
		.data(data)
		.each(function(d, i) { 
			d3.select(this)
			.attr("y", (i * height) + ((1 + i) * trueSeperation));
		});

	// make seperation better for text boxes
	d3.selectAll(".st2")
		.data(data)
		.each(function(d, i) { 
			d3.select(this)
			.attr("y", (i * height) + ((1 + i) * trueSeperation));
		});

	// enter text in text boxes
	d3.select("svg").selectAll("text")
		.data(data).enter()
		.append("text")
		.text( function(d) { 
			return d.amount; 
		})
		.attr("x", xText)
		.attr("y", function(d, i) {
			return ((i * height) + ((1 + i) * trueSeperation)) + 20; 
		});
});