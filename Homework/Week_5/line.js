window.onload = function() {
	
	d3.json("data_KNMI_.json", function(error, data) {
	
	if (error) throw error;

	console.log(data);
	}
}