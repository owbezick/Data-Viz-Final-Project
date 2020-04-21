var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  width = 1300 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

// The svg
var svg = d3.select("#usaMap")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("transform", "translate(0, 40)");

var usaCodes = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
}

var canCodes = {
  "NL": "Newfoundland and Labrador",
  "PE": "Prince Edward Island",
  "NS": "Nova Scotia",
  "NB": "New Brunswick",
  "QC": "Québec",
  "ON": "Ontario",
  "MB": "Manitoba",
  "SK": "Saskatchewan",
  "AB": "Alberta",
  "BC": "British Columbia",
  "YT": "Yukon",
  "NT": "Northwest Territories",
  "NU": "Nunavut"
}

var usaColorScale = d3.scaleThreshold()
  .domain([1, 100, 500, 1000, 5000, 10000, 50000, 100000, 300000])
  .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

// Map and projection
var path = d3.geoPath();

var projection = d3.geoAlbers()
  .center([-20, 45])
  .parallels([0, 45])
  .scale(600)
  .translate([width / 2, height / 2])

var path = d3.geoPath()
  .projection(projection);

// Data and color scale
var data = d3.map();

var legendObj = d3.select("#usaMap")
  .append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(20,20)");

legendObj.append("text")
  .attr("class", "caption")
  .attr("x", 0)
  .attr("y", -6);

var labels = ['0', '1-100', '99-500', '501-1000', '1001-5000', "5001-10000", "10001-50000", "50001-100000", ">100000"];
var legend = d3.legendColor()
  .labels(function(d) {
    return labels[d.i];
  })
  .shapePadding(4)
  .scale(usaColorScale);

d3.select("#usaMap")
  .select(".legendThreshold")
  .call(legend);

// Load external data and boot
queue()
  .defer(d3.json, "states_provinces.json")
  .defer(d3.csv, "exp_scoring.csv")
  .await(ready);

function ready(error, topo, data) {
  if (error) throw error;

  // List of groups
  var groups = ["Points", "Goals", "Assists"];

  // add the options to the button
  d3.select("#usaSelectButton")
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
    if (d.birthCountry == "USA") {
      d.state = usaCodes[d.birthState];
    } else if (d.birthCountry == "Canada") {
      d.state = canCodes[d.birthState];
    } else {
      return;
    }

    if (!scoring.hasOwnProperty(d.state)) {
      scoring[d.state] = {
        points: 0,
        goals: 0,
        assists: 0,
        playerList: [],
        totalPlayers: 0
      };
    }
    if (d.Pts != "NA") {
      scoring[d.state].points += (+d.Pts);
      scoring[d.state].goals += (+d.G);
      scoring[d.state].assists += (+d.A);
    }
    if (!(scoring[d.state].playerList.includes(d.playerID))) {
      scoring[d.state].playerList.push(d.playerID);
      scoring[d.state].totalPlayers += 1;
    }
  });

  console.log(scoring);

  // Draw the map
  d3.select("#usaMap")
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topo.features)
    .enter().append("path")
    .attr("fill", function(d) {
      // Pull data for this country
      if (scoring.hasOwnProperty(d.properties.name)) {
        return usaColorScale(scoring[d.properties.name].points);
      } else {
        return "lightgrey";
      }
    })
    .attr("d", path)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove);

  d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none");

  function mouseover(d) {
    d3.select(".tooltip").style("display", "inline");

    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  }

  function mousemove(d) {

    d3.select(".tooltip")
      .style("left", (d3.event.pageX + 1) + "px")
      .style("top", (d3.event.pageY - 50) + "px")

    if (scoring[d.properties.name]) {
      d3.select(".tooltip")
        .text(scoring[d.properties.name].totalPlayers + " professional hockey " +
          "players from " + d.properties.name + " have scored a total of " +
          scoring[d.properties.name].points + " points.");
    } else {
      d3.select(".tooltip")
        .text("No professional hockey players have been born in " +
          d.properties.name + ".");
    }
  }

  function mouseout(d) {
    d3.select(".tooltip").style("display", "none");

    d3.select(this)
      .style("stroke", "white")
      .style("opacity", 1);
  }

  // A function that updates the chart
  function update(selectedGroup, topo, data) {

    // Three function that change the tooltip when user hover / move / leave a cell
    function mouseover(d) {
      d3.select(".tooltip").style("display", "inline");

      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
    }

    var mousemove = function(d) {

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

      d3.select(".tooltip")
        .style("left", (d3.event.pageX + 1) + "px")
        .style("top", (d3.event.pageY - 50) + "px")

      if (scoring[d.properties.name]) {
        d3.select(".tooltip")
          .text(scoring[d.properties.name].totalPlayers + " professional hockey " +
            "players from " + d.properties.name + " have scored a total of " +
            numberToShow + " " + selectedGroup.toLowerCase() + ".");
      } else {
        d3.select(".tooltip")
          .text("No professional hockey players have been born in " +
            d.properties.name + ".");
      }
    }

    function mouseout(d) {
      d3.select(".tooltip").style("display", "none");

      d3.select(this)
        .style("stroke", "white")
        .style("opacity", 1);
    }

    d3.select("#usaMap")
      .select(".states").remove();

    // Draw the map
    d3.select("#usaMap")
      .append("g")
      .attr("class", "states")
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

          return usaColorScale(numberToShow);
        } else {
          return "lightgrey";
        }
      })
      .attr("d", path)
      .style("stroke", "white")
      .style("opacity", 1)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseout);
  }

  // When the button is changed, run the updateChart function
  d3.select("#usaSelectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update(selectedOption, topo, data)
  })
}