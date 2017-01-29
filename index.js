window.addEventListener('load', init, false);

var current_rate = 60;
var min_rate = 50;
var max_rate = 150;

function init() {
  doPoll();
}

function doPoll(){
  $.get('rate.json', function(data) {
      current_rate = data.rate;
      $('#heartrate p').text(current_rate);
      setTimeout(doPoll,1500);
  });
}

animation_rate = 700;
animation_rate = 700 - (current_rate * 4);
animation_rate = animation_rate < 200 ? 200 : animation_rate;
(function pulse(back) {
    var $heart = $('.heart');
    $('.heart').animate({
      width: (back) ? $heart.width() + 2 : $heart.width() - 2
    }, animation_rate, function(){pulse(!back)});
})(false);

var limit = 120,
    duration = 750,
    now = new Date(Date.now() - duration)

var width = 600,
    height = 300

var series = {
  value: 0,
  color: 'white',
  data: d3.range(limit).map(function() {
      return min_rate;
  })
}

var x = d3.time.scale()
    .domain([now - (limit - 2), now - duration])
    .range([0, width])

var y = d3.scale.linear()
    .domain([min_rate, max_rate])
    .range([height + min_rate, min_rate])

var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d, i) {
      return x(now - (limit - 1 - i) * duration)
    })
    .y(function(d) {
      return y(d)
    })

var svg = d3.select('#canvas').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height + (min_rate * 2))

//Container for the gradients
var defs = svg.append("defs");

// Filter for the outside glow

var filter = defs.append("filter")
    .attr("id","glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation","3.5")
    .attr("result","coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in","coloredBlur");
feMerge.append("feMergeNode")
    .attr("in","SourceGraphic");

var paths = svg.append('g')

series.path = paths.append('path')
  .data([series.data])
  .attr('class', 'series-path')
  .style('stroke', series.color)
  .style("filter", "url(#glow)")

function tick() {
now = new Date();
  // Add new values

  series.data.push(current_rate)
  series.path.attr('d', line)

  // Shift domain
  x.domain([now - (limit - 2) * duration, now - duration])

  // Slide paths left
  paths.attr('transform', null)
      .transition()
      .duration(duration)
      .ease('linear')
      .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
      .each('end', tick)

  series.data.shift();
}

tick();
