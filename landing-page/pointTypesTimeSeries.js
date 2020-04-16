
// Set the dimensions of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// Append the svg canvas
var pointTypesTimeSeries = d3.select("#pointtypes").append("svg")
.attr("width", 210 + width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom + 100)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the date/time data
var x = d3.scaleTime().range([0, width]),
y = d3.scaleLinear().range([height, 0]),
z = d3.scaleOrdinal(d3.schemeCategory10);

bisectDate = d3.bisector(function(d) { return d.value.year; }).left;

// d3 line generator
var linegoals = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.goals))
.curve(d3.curveLinear);

var linepoints = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.points))
.curve(d3.curveLinear);

var lineassists = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.assists))
.curve(d3.curveLinear);

var parseTime = d3.timeParse("%Y");
// Create data set: df_scoring
data = d3.csv("Scoring.csv").then(data => {
  data.forEach(d => {
    d.year = parseTime(d.year);
    d.goals = +d.G;
    d.assists = +d.A;
    d.points = +d.Pts
  });

  // Create data set: sumYearlyData
  var sumYearlyData = d3.nest()
  .key(d => d.year)
  .rollup(v => {
    return {
      year: v[0].year,
      goals: d3.sum(v, d => d.goals),
      points: d3.sum(v, d => d.points),
      assists: d3.sum(v, d => d.assists),
    }
  })
  .entries(data);
  //console.log(sumYearlyData)
  // Sort sum_yearly_goals by year
  sumYearlyData.sort(function(x, y){
    return d3.ascending(x.value.year, y.value.year);
  })

  // Scale the range of the data
  x.domain(d3.extent(sumYearlyData, d => d.value.year));
  y.domain([0, d3.max(sumYearlyData, d => d.value.points)]);

  // Add the x-axis
  pointTypesTimeSeries.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .append("text")
  .attr("y", 25)
  .attr("x", 450)
  .attr("dy", "1em")
  .attr("fill", "#000")
  .attr('font-size', '20px')
  .text("Year");

  // Add the y-axis
  pointTypesTimeSeries.append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .attr('font-size', '18px')
  .attr("fill", "#000")
  .text("Totals")


  var mouseGPoints = pointTypesTimeSeries.append("g")
  .attr("class", "mouse-over-effects");

  var mousePerLinePoints = mouseGPoints.selectAll('.mouse-per-line-points')
  .data(sumYearlyData)
  .enter()
  .append("g")
  .attr("class", "mouse-per-line");

  // Append Circles
  mousePerLinePoints.append("circle")
  .attr("r", 5)
  .style("stroke", "#d73027")
  .style("fill", "#d73027")
  .style("stroke-width", "1px")
  .attr("class", "line-circle-assists");

  mousePerLinePoints.append("circle")
  .attr("r", 5)
  .style("stroke", "#1a9850")
  .style("fill", "#1a9850")
  .style("stroke-width", "1px")
  .attr("class", "line-circle-goals");

  mousePerLinePoints.append("circle")
  .attr("r", 5)
  .style("stroke", "#4575b4")
  .style("fill", "#4575b4")
  .style("stroke-width", "1px")
  .attr("class", "line-circle-points");

  // Append Labels
  mousePerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel")
  .text("");

  mousePerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel1")
  .text("");

  mousePerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel2")
  .text("");

  mouseGPoints.append("line") // this is the black vertical line to follow mouse
  .attr("class", ".mouse-line")
  .style("stroke", "black")
  .style("stroke-width", "1px");

  mouseGPoints.append('pointTypesTimeSeries:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mousemove', function() { // mouse moving over canvas
    var mouse = d3.mouse(this);
    d3.select(".mouse-line")
    .attr("x1", mouse[0])
    .attr("y1", 0)
    .attr("y2", height)
    .attr("x2", mouse[0]);

    format = d3.timeFormat("%Y");
    var xVar = parseTime(format(x.invert(mouse[0])));
    var yVar = sumYearlyData[getIndexinRollup(xVar)];

  // Add the line
  var pathgoals = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line")
  .attr("d", d => linegoals(d))
  .style("stroke", "#1a9850");

  var pathGame = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line assists")
  .attr("d", d => lineassists(d))
  .style("stroke", "#d73027");

  var pathpoints = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line points")
  .attr("d", d => linepoints(d))
  .style("stroke", "#4575b4");
  // Append Circles & Labels
  d3.select(".line-circle-assists")
  .attr("cx", mouse[0])
  .attr("cy", function (){
    return y(yVar.value.assists);
  });

  d3.select(".tooltiplabel")
  .attr("x", mouse[0] + 10)
  .attr("y", function (){
    return y(yVar.value.assists);
  })
  .text(yVar.value.assists + " Assists in " + format(xVar));

  d3.select(".line-circle-goals")
  .attr("cx", mouse[0])
  .attr("cy", function (){
    return y(yVar.value.goals);
  });

  d3.select(".tooltiplabel1")
  .attr("x", mouse[0] + 10)
  .attr("y", function (){
    return y(yVar.value.goals);
  })
  .text(yVar.value.goals + " Goals in " + format(xVar));


  d3.select(".line-circle-points")
  .attr("cx", mouse[0])
  .attr("cy", function (){
    return y(yVar.value.points);
  });

  d3.select(".tooltiplabel2")
  .attr("x", mouse[0] + 10)
  .attr("y", function (){
    return y(yVar.value.points);
  })
  .text(yVar.value.points + " Points in " + format(xVar));
});

  function getIndexinRollup(key){
    format = d3.timeFormat("%Y");
    var index = -1;
    for (var i = 0; i < sumYearlyData.length; i++){
      //console.log(format(key) + " " +  format(sumYearlyData[i].value.year));
      if (format(key) == format(sumYearlyData[i].value.year)){
        index = i;
      }
    }
    return index;
  }

});
