
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

// Title
pointTypesTimeSeries.append('text')
.text('Points Over Time')
.attr('x', 375)
.attr('y', 0);

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


  var mousePGPoints = pointTypesTimeSeries.append("g")
  .attr("class", "mouseP-over-effects");

  var mousePPerLinePoints = mousePGPoints.selectAll('.mouseP-per-line-points')
  .data(sumYearlyData)
  .enter()
  .append("g")
  .attr("class", "mouseP-per-line");

  // Append Circles
  mousePPerLinePoints.append("circle")
  .attr("r", 7)
  .style("stroke", "black")
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("fill-opacity", "0")
  .attr("class", "line-circle-assists");

  mousePPerLinePoints.append("circle")
  .attr("r", 7)
  .style("stroke", "black")
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("fill-opacity", "0")
  .attr("class", "line-circle-goals");

  mousePPerLinePoints.append("circle")
  .attr("r", 7)
  .style("stroke", "black")
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("fill-opacity", "0")
  .attr("class", "line-circle-points");

  // Append Labels
  mousePPerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel")
  .text("");

  mousePPerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel1")
  .text("");

  mousePPerLinePoints.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel2")
  .text("");

  mousePGPoints.append("line") // this is the black vertical line to follow mouseP
  .attr("class", "mouseP-line-points")
  .style("stroke", "black")
  .style("stroke-width", "1px");

  mousePGPoints.append('pointTypesTimeSeries:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mousePmovepoits', function() { // mouseP moving over canvas
    var mouseP = d3.mouseP(this);
    d3.select(".mouseP-line-points")
    .attr("x1", mouseP[0])
    .attr("y1", 0)
    .attr("y2", height)
    .attr("x2", mouseP[0]);

    format = d3.timeFormat("%Y");
    var xVarP = parseTime(format(x.invert(mouseP[0])));
    var yVarP = sumYearlyData[getIndexinRollup(xVarP)];

    // Append Circles & Labels
    d3.select(".line-circle-assists")
    .attr("cx", mouseP[0])
    .attr("cy", function (){
      return y(yVarP.value.assists);
    });

    d3.select(".tooltiplabel")
    .attr("x", mouseP[0] + 10)
    .attr("y", function (){
      return y(yVarP.value.assists);
    })
    .text(yVarP.value.assists + " Assists in " + format(xVarP));

    d3.select(".line-circle-goals")
    .attr("cx", mouseP[0])
    .attr("cy", function (){
      return y(yVarP.value.goals);
    });

    d3.select(".tooltiplabel1")
    .attr("x", mouseP[0] + 10)
    .attr("y", function (){
      return y(yVarP.value.goals);
    })
    .text(yVarP.value.goals + " Goals in " + format(xVarP));


    d3.select(".line-circle-points")
    .attr("cx", mouseP[0])
    .attr("cy", function (){
      return y(yVarP.value.points);
    });

    d3.select(".tooltiplabel2")
    .attr("x", mouseP[0] + 10)
    .attr("y", function (){
      return y(yVarP.value.points);
    })
    .text(yVarP.value.points + " Points in " + format(xVarP));
  });

  // Add the line
  var pathgoals = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line")
  .attr("d", d => linegoals(d))
  .style("stroke", "#b3e2cd");

  var pathGame = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line assists")
  .attr("d", d => lineassists(d))
  .style("stroke", "#cbd5e8");

  var pathpoints = pointTypesTimeSeries.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line points")
  .attr("d", d => linepoints(d))
  .style("stroke", "#fdcdac");

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
