var d3 = require('d3');
var d3ScaleChromatic = require('./d3-scale-chromatic.min.js');


var height = 2250;
var width = 980;
var deptNum = 25;

var margins = {
      'left': 300,
      'top': 180,
      'right': 70,
      'bottom': 0,
    };

var svg = d3.select("#matrix").append("svg")
        .attr("width", width)
        .attr("height", height);
        // .attr("preserveAspectRatio", "xMidYMid meet")
        // .attr("viewBox", `0 0 ${width} ${height}`);

var chart = svg.append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

var chartWidth = width - margins.left - margins.right;
var chartHeight = height - margins.top - margins.bottom;

var elementWidth = Math.floor(chartWidth/deptNum);

d3.csv("../data/major_dept_ratios.csv", function(err, data) {

  var colorScale_above1 = d3.scaleLinear()
                      .domain([1, d3.max(data, function(d) { return d.Ratio})])
                      .range([0.5, 1]);

  var colorScale_below1 = d3.scaleLinear()
                      .domain([0, 1])
                      .range([0, 0.5]);

  var colors = function(t) {
    if (t < 1) {
      return d3ScaleChromatic.interpolateRdPu(colorScale_below1(t));
    } else
      return d3ScaleChromatic.interpolateRdPu(colorScale_above1(t));
    };


  var chartData = d3.nest()
          .key(d => d.Major)
          .entries(data);

  //creating a mapping for majors and departments where 'computer science' == 1 (0-79), 'Computer Science' == 0 (0 - 24)
  var majorMapping = {}, deptMapping = {};
  for (var i = 0, len = chartData.length; i < len; i++) {
    var majorKey = chartData[i].key.split(" prop")[0]; // Take out if change data
    majorMapping[majorKey] = i;
  }
  for (var i = 0, depts = chartData[0].values, len = depts.length; i < len; i++) {
    deptMapping[depts[i].Department] = i;
  }

  var majorLabels = chart
      .selectAll(".majorLabel")
      .data(Object.keys(majorMapping))
      .enter().append("text")
      .attr("class", "majorLabel")
      .text(d => d)
      .attr("x", 0)
      .attr("y", (d) => majorMapping[d]*elementWidth)
      .attr("transform", "translate(-6," + elementWidth / 1.5 + ")");

  var deptLabels = chart
      .selectAll(".deptLabel")
      .data(Object.keys(deptMapping))
      .enter().append("text")
      .text(d => d.toLowerCase())
      .attr("y", 0)
      .attr("x", elementWidth)
      .attr("transform", (d) => `translate(${deptMapping[d]*elementWidth - elementWidth/3}, 10) rotate(-50)`)
      .attr("class", "deptLabel");

  var grid = chart.selectAll('g')
          .data(data)
          .enter().append('g');

  grid.append("rect")
      .attr("x", d => deptMapping[d.Department] * elementWidth)
      .attr("y", d => majorMapping[d.Major] * elementWidth)
      .attr('height', elementWidth)
      .attr('width', elementWidth)
      .attr("class", "grid")
      .style("fill", d => colors(d.Ratio));



});
