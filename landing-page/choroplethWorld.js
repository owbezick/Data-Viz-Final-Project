var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  width = 1300 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

// The svg
var svg = d3.select("#worldMap")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("transform", "translate(0, 40)");

// Map and projection
var path = d3.geoPath();

var projection = d3.geoNaturalEarth()
  .scale(width / 2 / Math.PI)
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);

// Data and color scale
var data = d3.map();
var colorScheme = d3.schemeReds[6];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
  .domain([1, 100, 1000, 10000, 100000, 1000000])
  .range(colorScheme);

// Legend
var g = svg.append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(20,20)");

g.append("text")
  .attr("class", "caption")
  .attr("x", 0)
  .attr("y", -6)
  .text("Points");

var labels = ['0', '1-99', '100-999', '1000-9999', '10000-99999', '100000-999999', "> 1000000"];
var legend = d3.legendColor()
  .labels(function(d) {
    return labels[d.i];
  })
  .shapePadding(4)
  .scale(colorScale);

svg.select(".legendThreshold")
  .call(legend);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
  .defer(d3.csv, "exp_scoring.csv")
  .await(ready);

function ready(error, topo, data) {
  if (error) throw error;

  // List of groups
  var groups = ["Points", "Goals", "Assists"];

  // add the options to the button
  d3.select("#worldSelectButton")
    .attr("transform", "translate(0," + height + ")")
    .selectAll('myOptions')
    .data(groups)
    .enter()
    .append('option')
    .text(function(d) {
      return d;
    }) // text showed in the menu
    .attr("value", function(d) {
      return d;
    }) // corresponding value returned by the button

  var scoring = {}

  data.forEach(d => {
    if (d.birthCountry == "Brunei Darussalam") {
      d.birthCountry = "Brunei";
    } else if (d.birthCountry == "USSR") {
      d.birthCountry = "Russia";
    }
    if (!scoring.hasOwnProperty(d.birthCountry)) {
      scoring[d.birthCountry] = {
        points: 0,
        goals: 0,
        assists: 0,
        playerList: [],
        totalPlayers: 0
      };
    }
    if (d.Pts != "NA") {
      scoring[d.birthCountry].points += (+d.Pts);
      scoring[d.birthCountry].assists += (+d.A);
      scoring[d.birthCountry].goals += (+d.G);
    }
    if (!(scoring[d.birthCountry].playerList.includes(d.playerID))) {
      scoring[d.birthCountry].playerList.push(d.playerID);
      scoring[d.birthCountry].totalPlayers += 1;
    }
  });

  console.log(scoring);

  // create a tooltip
  var tooltip = svg.append("g")
    .style("display", "none");;

  var rect = tooltip.append("rect");

  var tiptext = tooltip.append("text")
    .attr("class", "tiptext")
    .attr("stroke", "black");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip.style("display", null);

    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  }

  var mousemove = function(d) {
    tooltip.select("rect")
      .attr("width", "200px")
      .attr("height", "100px")
      .style("stroke", "black")
      .attr("fill", "#d3d3d3")
      .style("opacity", 1);

    if (scoring[d.properties.name]) {
      tooltip.select("rect")
        .attr("transform", "translate(" + d3.mouse(this)[0] + "," +
          d3.mouse(this)[1] + ")");

      tooltip.select(".tiptext")
        .html(scoring[d.properties.name].totalPlayers + " professional hockey " +
          "players from<br>" + d.properties.name + " have scored a total of " +
          scoring[d.properties.name].points + " points.</br>")
        .attr("transform", "translate(" + (d3.mouse(this)[0] + 5) + "," +
          (d3.mouse(this)[1] + 20) + ")");
    } else {
      tooltip.select("rect")
        .attr("transform", "translate(" + d3.mouse(this)[0] + "," +
          d3.mouse(this)[1] + ")");

      tooltip.select(".tiptext")
        .html("No professional hockey players<br>have been born in " +
          d.properties.name + ".</br>")
        .attr("transform", "translate(" + (d3.mouse(this)[0] + 5) + "," +
          (d3.mouse(this)[1] + 20) + ")");
    }
  }

  var mouseleave = function(d) {
    tooltip.style("display", "none");

    d3.select(this)
      .style("stroke", "white")
      .style("opacity", 1);
  }

  // Draw the map
  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(topo.features)
    .enter().append("path")
    .attr("fill", function(d) {
      // Pull data for this country
      if (scoring.hasOwnProperty(d.properties.name)) {
        return colorScale(scoring[d.properties.name].points);
      } else {
        return "black";
      }
    })
    .attr("d", path)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // A function that updates the chart
  function update(selectedGroup, topo, data) {

    d3.select(".caption")
      .html(selectedGroup);

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      tooltip.style("display", null);

      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
    }

    var mousemove = function(d) {
      tooltip.select("rect")
        .attr("width", "200px")
        .attr("height", "100px")
        .style("stroke", "black")
        .attr("fill", "#d3d3d3")
        .style("opacity", 1);

      var numberToShow;

      if (scoring.hasOwnProperty(d.properties.name)) {
        if (selectedGroup == "Points") {
          numberToShow = scoring[d.properties.name].points;
        } else if (selectedGroup == "Goals") {
          numberToShow = scoring[d.properties.name].goals;
        } else {
          numberToShow = scoring[d.properties.name].assists;
        }
      }

      if (scoring[d.properties.name]) {
        tooltip.select("rect")
          .attr("transform", "translate(" + d3.mouse(this)[0] + "," +
            d3.mouse(this)[1] + ")");

        tooltip.select(".tiptext")
          .html(scoring[d.properties.name].totalPlayers +
            " professional hockey players from<br>" + d.properties.name +
            " have scored a total of " + numberToShow + " " + selectedGroup.toLowerCase() + ".")
          .attr("transform", "translate(" + (d3.mouse(this)[0] + 5) + "," +
            (d3.mouse(this)[1] + 20) + ")");
      } else {
        tooltip.select("rect")
          .attr("transform", "translate(" + d3.mouse(this)[0] + "," +
            d3.mouse(this)[1] + ")");

        tooltip.select(".tiptext")
          .html("No professional hockey players<br>have been born in " +
            d.properties.name + ".</br>")
          .attr("transform", "translate(" + (d3.mouse(this)[0] + 5) + "," +
            (d3.mouse(this)[1] + 20) + ")");
      }
    }

    var mouseleave = function(d) {
      tooltip.style("display", "none");

      d3.select(this)
        .style("stroke", "white")
        .style("opacity", 1);
    }

    svg.select(".countries").remove();

    // Draw the map
    svg.append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(topo.features)
      .enter().append("path")
      .attr("fill", function(d) {

        if (scoring.hasOwnProperty(d.properties.name)) {
          var numberToShow;

          if (selectedGroup == "Points") {
            numberToShow = scoring[d.properties.name].points;
          } else if (selectedGroup == "Goals") {
            numberToShow = scoring[d.properties.name].goals;
          } else {
            numberToShow = scoring[d.properties.name].assists;
          }

          return colorScale(numberToShow);
        } else {
          return "black";
        }
      })
      .attr("d", path)
      .style("stroke", "white")
      .style("opacity", 1)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

  }

  // When the button is changed, run the updateChart function
  d3.select("#worldSelectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value");
    // run the updateChart function with this selected option
    update(selectedOption, topo, data);
  })
}