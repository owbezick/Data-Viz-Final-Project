
// Set the dimensions of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// Append the svg canvas
var gameLine = d3.select("#gametypes").append("svg")
.attr("width", 220 + width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom + 100)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the date/time data
var x = d3.scaleTime().range([0, width]),
y = d3.scaleLinear().range([height, 0]),
z = d3.scaleOrdinal(d3.schemeCategory10);

bisectDate = d3.bisector(function(d) { return d.value.year; }).left;

// d3 line generator
var lineovertimeGames = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.overtimeGames))
.curve(d3.curveLinear);

var lineShootouts = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.shootouts))
.curve(d3.curveLinear);

var lineGames = d3.line()
.x(d => x(d.value.year))
.y(d => y(d.value.games))
.curve(d3.curveLinear);

var parseTime = d3.timeParse("%Y");

// Create data set: df_scoring
data = d3.csv("Teams.csv").then(data => {
  data.forEach(d => {
    d.year = parseTime(d.year);
    d.overtimeGames = +d.OTL;
    d.games = +d.G;
    d.shootouts = +d.SoL
  });

  // Create data set: sumYearlyData
  var sumYearlyData = d3.nest()
  .key(d => d.year)
  .rollup(v => {
    return {
      year: v[0].year,
      overtimeGames: d3.sum(v, d => d.overtimeGames),
      shootouts: d3.sum(v, d => d.shootouts),
      games: d3.sum(v, d => d.games),
    }
  })
  .entries(data);

  // Sort sum_yearly_overtimeGames by year
  sumYearlyData.sort(function(x, y){
    return d3.ascending(x.value.year, y.value.year);
  })

  // Scale the range of the data
  x.domain(d3.extent(sumYearlyData, d => d.value.year));
  y.domain([0, d3.max(sumYearlyData, d => d.value.games)]);

  // Add the x-axis
  gameLine.append("g")
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
  gameLine.append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .attr('font-size', '18px')
  .attr("fill", "#000")
  .text("Total Games")


  var mouseGGGames = gameLine.append("g")
  .attr("class", "mouseG-over-effects");

  var mouseGPerLineGames = mouseGGGames.selectAll('.mouseG-per-line')
  .data(sumYearlyData)
  .enter()
  .append("g")
  .attr("class", "mouseG-per-line");

  // Append Circles
  mouseGPerLineGames.append("circle")
  .attr("r", 5)
  .style("stroke", "#d73027")
  .style("fill", "#d73027")
  .style("stroke-width", "1px")
  .attr("class", "line-circle");

  mouseGPerLineGames.append("circle")
  .attr("r", 5)
  .style("stroke", "#4575b4")
  .style("fill", "#4575b4")
  .style("stroke-width", "1px")
  .attr("class", "line-circle1");

  mouseGPerLineGames.append("circle")
  .attr("r", 5)
  .style("stroke", "#1a9850")
  .style("fill", "#1a9850")
  .style("stroke-width", "1px")
  .attr("class", "line-circle2");

  // Append Labels
  mouseGPerLineGames.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel")
  .text("");

  mouseGPerLineGames.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel1")
  .text("");

  mouseGPerLineGames.append("text")
  .style("stroke-width", "1px")
  .attr("class", "tooltiplabel2")
  .text("");

  mouseGGGames.append("line") // this is the black vertical line to follow mouseG
  .attr("class", "mouseG-line")
  .style("stroke", "black")
  .style("stroke-width", "1px");

  mouseGGGames.append('gameLine:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mouseGmove', function() { // mouseG moving over canvas
    var mouseG = d3.mouseG(this);
    d3.select(".mouseG-line")
    .attr("x1", mouseG[0])
    .attr("y1", 0)
    .attr("y2", height)
    .attr("x2", mouseG[0]);

    format = d3.timeFormat("%Y");
    var xVarG = parseTime(format(x.invert(mouseG[0])));
    var yVarG = sumYearlyData[getIndexinRollup(xVarG)];

    // Append Circles & Labels
    d3.select(".line-circle")
    .attr("cx", mouseG[0])
    .attr("cy", function (){
      return y(yVarG.value.games);
    });

    d3.select(".tooltiplabel")
    .attr("x", mouseG[0] + 10)
    .attr("y", function (){
      return y(yVarG.value.games);
    })
    .text(yVarG.value.games + " Games in " + format(xVarG));

    d3.select(".line-circle1")
    .attr("cx", mouseG[0])
    .attr("cy", function (){
      return y(yVarG.value.overtimeGames);
    });

    d3.select(".tooltiplabel1")
    .attr("x", mouseG[0] + 10)
    .attr("y", function (){
      return y(yVarG.value.overtimeGames);
    })
    .text(yVarG.value.overtimeGames + " Overtime Games in " + format(xVarG));


    d3.select(".line-circle2")
    .attr("cx", mouseG[0])
    .attr("cy", function (){
      return y(yVarG.value.shootouts);
    });

    d3.select(".tooltiplabel2")
    .attr("x", mouseG[0] + 10)
    .attr("y", function (){
      return y(yVarG.value.shootouts);
    })
    .text(yVarG.value.shootouts + " Shootouts in " + format(xVarG));
  });

  // Add the line
  var pathovertimeGames = gameLine.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line")
  .attr("d", d => lineovertimeGames(d))
  .style("stroke", "#4575b4");

  var pathGame = gameLine.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line games")
  .attr("d", d => lineGames(d))
  .style("stroke", "#d73027");

  var pathshootouts = gameLine.append("path")
  .datum(sumYearlyData) // bind data
  .attr("class", "line shootouts")
  .attr("d", d => lineShootouts(d))
  .style("stroke", "#1a9850");

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
