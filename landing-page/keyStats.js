
d3.csv("gameScoring.csv").then(d => chart(d))

function chart(data) {

	var keys = data.columns.slice(1);
	console.log(keys)
	var parseTime = d3.timeParse("%Y"),
		formatyear = d3.timeFormat("%Y"),
		bisectyear = d3.bisector(d => d.year).left,
		formatValue = d3.format(",.0f");

	data.forEach(function(d) {
		d.year = parseTime(d.year);
		return d;
	})
	console.log(data);
	var svg = d3.select("#chart"),
		margin = {top: 25, right: 35, bottom: 15, left: 200},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleTime()
		.rangeRound([margin.left, width - margin.right])
		.domain(d3.extent(data, d => d.year))

	var y = d3.scaleLinear()
		.rangeRound([height - margin.bottom, margin.top]);

	var z = d3.scaleOrdinal(d3.schemeCategory10);

	var line = d3.line()
		.curve(d3.curveCardinal)
		.x(d => x(d.year))
		.y(d => y(d.metric));

	svg.append("g")
		.attr("class","x-axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + margin.left + ",0)");

	var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line").attr("class", "lineHover")
		.style("stroke", "#999")
		.attr("stroke-width", 1)
		.style("shape-rendering", "crispEdges")
		.style("opatype", 0.5)
		.attr("y1", -height)
		.attr("y2",0);

	focus.append("text").attr("class", "lineHoveryear")
		.attr("text-anchor", "middle")
		.attr("font-size", 12);

	var overlay = svg.append("rect")
		.attr("class", "overlay")
		.attr("x", margin.left)
		.attr("width", width - margin.right - margin.left)
		.attr("height", height)

	upyear(d3.select('#selectbox').property('value'), 0);

	function upyear(input, speed) {

		var copy = keys.filter(f => f.includes(input))
		console.log(copy);
		var types = copy.map(function(id) {
			return {
				id: id,
				values: data.map(d => {return {year: d.year, metric: +d[id]}})
			};
		});
		console.log(types);
		y.domain([
			d3.min(types, d => d3.min(d.values, c => c.metric)),
			d3.max(types, d => d3.max(d.values, c => c.metric))
		]).nice();

		svg.selectAll(".y-axis").transition()
			.duration(speed)
			.call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

		var type = svg.selectAll(".type")
			.data(types);

		type.exit().remove();

		type.enter().insert("g", ".focus").append("path")
			.attr("class", "line type")
			.style("stroke", d => z(d.id))
			.merge(type)
		.transition().duration(speed)
			.attr("d", d => line(d.values))

		tooltip(copy);
	}

	function tooltip(copy) {

		var labels = focus.selectAll(".lineHoverText")
			.data(copy)

		labels.enter().append("text")
			.attr("class", "lineHoverText")
			.style("fill", d => z(d))
			.attr("text-anchor", "start")
			.attr("font-size",15)
			.attr("dy", (_, i) => 1 + i * 2 + "em")
			.merge(labels);

		var circles = focus.selectAll(".hoverCircle")
			.data(copy)

		circles.enter().append("circle")
			.attr("class", "hoverCircle")
			.style("fill", d => z(d))
			.attr("r", 5)
			.merge(circles);

		svg.selectAll(".overlay")
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove);

		function mousemove() {

			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectyear(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.year > d1.year - x0 ? d1 : d0;

			focus.select(".lineHover")
				.attr("transform", "translate(" + x(d.year) + "," + height + ")");

			focus.select(".lineHoveryear")
				.attr("transform",
					"translate(" + x(d.year) + "," + 15 + ")")
				.attr("font-size",20)
				.text(formatyear(d.year));

			focus.selectAll(".hoverCircle")
				.attr("cy", e => y(d[e]))
				.attr("cx", x(d.year));

			focus.selectAll(".lineHoverText")
				.attr("x", 0)
				.attr("y", 13)
				.attr("font-size",20)
				.text(e => e + " " + formatValue(d[e]));
		}
	}

	var selectbox = d3.select("#selectbox")
		.on("change", function() {
			upyear(this.value, 750);
		})
}
