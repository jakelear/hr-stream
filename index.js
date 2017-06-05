var HRStream = {
  poll_timing: 1500,
  current_rate: 60,
  min_rate: 50,
  max_rate: 150,
  pulse_anim_rate: 700,
  graph_height: 720,
  graph_width: 1280,
  graph_color: '#FFF',

  /**
  * init
  * Fired on page load to kick off update loop, pulse animation, and line graph
  */
  init: function() {
    HRStream.updateRate();
    HRStream.pulse();
    HRStream.renderGraph();
  },

  /**
  * updateRate
  * gets the current rate from rate.json
  * updates the text and the current_rate var (which is used for the line graph)
  */
  updateRate: function() {
    $.get('rate.json', function(data) {
      HRStream.current_rate = data.rate;
      $('#heartrate-number').text(HRStream.current_rate);
      setTimeout(HRStream.updateRate, HRStream.poll_timing);
    });
  },

  /**
  * pulse
  * Animates the heart icon to pulse at varying speeds
  * Speeds up based on current_rate to a max of every 200ms
  */
  pulse: function(back) {
    var animation_rate = HRStream.pulse_anim_rate;
    animation_rate = HRStream.pulse_anim_rate - (HRStream.current_rate * 4);
    // If hr gets high enough that anim rate drops below 200, peg it at 200
    animation_rate = animation_rate < 200 ? 200 : animation_rate;
    var $heart = $('.heart');
    $heart.animate({
      width: (back) ? $heart.width() + 4 : $heart.width() - 4
    }, animation_rate, function(){HRStream.pulse(!back)});
  },

  /**
  * renderGraph
  * sets up a basic d3 streaming line graph
  */
  renderGraph: function (){
    var limit = 120,
        duration = 750,
        now = new Date(Date.now() - duration)

    var width = HRStream.graph_width,
        height = HRStream.graph_height;

    var series = {
      value: 0,
      color: HRStream.graph_color,
      data: d3.range(limit).map(function() {
          return HRStream.min_rate;
      })
    }

    var x = d3.time.scale()
        .domain([now - (limit - 2), now - duration])
        .range([0, width])

    var y = d3.scale.linear()
        .domain([HRStream.min_rate, HRStream.max_rate])
        .range([height + HRStream.min_rate, HRStream.min_rate])

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
        .attr('height', height + (HRStream.min_rate * 2))

    //Container for the gradients
    var defs = svg.append("defs");

    // Filter for the outside glow

    var filter = defs.append("filter")
        .attr("id","glow")
        .attr("height", "300%")
        .attr("width", "300%");
    filter.append("feFlood")
      .attr("flood-color", "#2dff0a")
      .attr("flood-opacity", "1");
    filter.append("feComposite")
      .attr("in", "flood")
      .attr("result", "mask")
      .attr("in2", "SourceGraphic")
      .attr("operator", "in");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","10.5")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","blurred");
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
      series.data.push(HRStream.current_rate)
      series.path.attr('d', line)

      // Shift domain
      x.domain([now - (limit - 2) * duration, now - duration])

      // Slide paths left
      // When slide is done, fire tick again
      paths.attr('transform', '')
          .transition()
          .duration(duration)
          .ease('linear')
          .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
          .each('end', tick)

      series.data.shift();
    }

    tick();
  }

};

/**
* Run the init on page load
*/
window.addEventListener('load', HRStream.init, false);
