var timeline = {
  draw: function(id) {

    // set the dimensions and margins of the graph
    var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 50
      },
      width = 500 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#timeline")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("exp_scoring.csv", function(error, data) {

      scoring = [];

      var parseTime = d3.timeParse("%Y");

      data.forEach(d => {
        if (d.fullName == id) {
          d.year = parseTime(+d.year);
          d.ppg = +d.Pts / d.GP;
          scoring.push({
            year: +d.year,
            points: +d.Pts,
            goals: +d.G,
            assists: +d.A,
            ppg: d.ppg
          })
        }
      });

      console.log(scoring);

      var x = d3.scaleTime()
        .domain(d3.extent(scoring, function(d) {
          return d.year;
        }))
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 2.7])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the area
      svg.append("path")
        .datum(scoring)
        .attr("fill", "#cce5df")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", d3.area()
          .x(function(d) {
            return x(d.year)
          })
          .y0(y(0))
          .y1(function(d) {
            return y(d.ppg)
          })
        );

      // text label for the x axis
      svg.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
          (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Year");

      // text label for the y axis
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Points Per Game");
    })
  },

  drawGoalie: function(id) {

    // set the dimensions and margins of the graph
    var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 50
      },
      width = 500 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#timeline")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("Goalies.csv", function(error, data) {

      scoring = [];

      var parseTime = d3.timeParse("%Y");

      data.forEach(d => {
        if (d.playerID == id) {
          d.year = parseTime(+d.year);
          d.saves = +d.SA - +d.GA;
          d.spg = d.saves / +d.GP;
          scoring.push({
            year: +d.year,
            wins: +d.W,
            shots: +d.SA,
            goals: +d.GA,
            shutouts: +d.SHO,
            spg: +d.spg
          })
        }
      });

      console.log(scoring);

      if (id == "plantja01") {
        var x = d3.scaleTime()
          .domain(d3.extent(scoring, function(d) {
            return d.year;
          }))
          .range([0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, d3.max(scoring, d => d.wins)])
          .range([height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Add the area
        svg.append("path")
          .datum(scoring)
          .attr("fill", "#cce5df")
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x(function(d) {
              return x(d.year)
            })
            .y0(y(0))
            .y1(function(d) {
              return y(d.wins)
            })
          );

        // text label for the x axis
        svg.append("text")
          .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text("Year");

        // text label for the y axis
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Wins");
      } else {

        var x = d3.scaleTime()
          .domain(d3.extent(scoring, function(d) {
            return d.year;
          }))
          .range([0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([10, d3.max(scoring, d => d.spg)])
          .range([height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Add the area
        svg.append("path")
          .datum(scoring)
          .attr("fill", "#cce5df")
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x(function(d) {
              return x(d.year)
            })
            .y0(y(10))
            .y1(function(d) {
              return y(d.spg)
            })
          );

        // text label for the x axis
        svg.append("text")
          .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text("Year");

        // text label for the y axis
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Saves Per Game");
      }
    })
  }
}