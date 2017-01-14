/*
 * app.js
 */

function getTranslation(transform) {
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttributeNS(null, "transform", transform);
  var matrix = g.transform.baseVal.consolidate().matrix;
  return [matrix.e, matrix.f];
}

(function () {
  var width = 960,
    height = 640,
    nodeWidth = 100,
    nodeHeight = 20,
    spacing = 100,
    portWidth = 14,
    portHeight = 2;

  // Drag Behavior
  var drag = d3.drag()
    .on("start", dragStarted)
    .on("drag", dragging)
    .on("end", dragEnded);

  // Zoom behavior
  var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .filter(function () {
      return (event.button === 1 || event.deltaX !== undefined);
    });

  // Describe Nodes
  var nodeData = [
    {name: "node1"},
    {name: "node2"},
    {name: "node3"},
  ];

  var connectionData = [
    {output: "node1", input: "node2"},
    {output: "node2", input: "node3"},
  ];

  var svg = d3.select("svg#demo")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

  // Marker Definition
  var defs = svg.append("defs");
  var marker = defs.append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refy", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto");

  marker.append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("class","arrowHead");

  // Root-level Group
  var group = svg.append("g")
    .attr("id", "root");

  // Bind
  zoom.on("zoom", zoomed(group));

  // Construct Nodes
  group.selectAll(".node")
    .data(nodeData)
    .enter()
    .append("g")
      .classed("node", true)
      .attr("data-name", function (d) {
        return d.name
      })
      .attr("transform", function (d, i) {
        return "translate(0," + (i * spacing) + ")";
      })
      .on("dblclick", function(d) {
        zoom.scaleTo(svg, 1, 1);

        var node = d3.select('g.node[data-name="' + d.name + '"]');
        var t0 = getTranslation(node.attr("transform"));

        var g = d3.select("g#root");
        var t1 = getTranslation(g.attr("transform"));

        console.log(t0, t1);

        zoom.translateBy(svg, -t1[0] - t0[0] + (width / 2), -t1[1] - t0[1] + (height / 2));
        zoom.scaleTo(svg, 4, 4);
      });

  group.selectAll("g.node")
    .append("rect")
      .classed("node-input", true)
      .attr("x", -portWidth / 2)
      .attr("y", (-nodeHeight / 2) - portHeight)
      .attr("width", portWidth)
      .attr("height", portHeight);

  group.selectAll("g.node")
    .append("rect")
      .classed("node-output", true)
      .attr("x", -portWidth / 2)
      .attr("y", (nodeHeight / 2))
      .attr("width", portWidth)
      .attr("height", portHeight);

  group.selectAll("g.node")
    .append("rect")
      .classed("node-body", true)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 1)
      .attr("ry", 1);

  group.selectAll("g.node")
    .append("text")
      .text(function (d) { return d.name })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");

  group.selectAll("g.node")
    .call(drag);

  // Construct Connections
  group.selectAll(".connection")
    .data(connectionData)
    .enter()
    .insert("g", ":first-child")
      .classed("connection", true);

  group.selectAll("g.connection")
    .append("line")
      .attr("class", "arrow")
      .attr("marker-end", "url(#arrow)");

  updateConnections();
  zoom.translateBy(svg, width/2, height/2 - spacing);

  function updateConnections() {
    d3.selectAll("g.connection > line")
      .attr("x1", function (d) {
        var node = d3.select('.node[data-name="' + d.output + '"]');
        var t = getTranslation(node.attr("transform"));
        return t[0];
      })
      .attr("y1", function (d) {
        var node = d3.select('.node[data-name="' + d.output + '"]');
        var t = getTranslation(node.attr("transform"));
        return t[1] + ((nodeHeight + portHeight) / 2);
      })
      .attr("x2", function (d) {
        var node = d3.select('.node[data-name="' + d.input + '"]');
        var t = getTranslation(node.attr("transform"));
        return t[0];
      })
      .attr("y2", function (d) {
        var node = d3.select('.node[data-name="' + d.input + '"]');
        var t = getTranslation(node.attr("transform"));
        return t[1] - (nodeHeight / 2) - (portHeight * 3/2);
      });
  }

  function dragStarted(d) {
    d3.event.sourceEvent.stopPropagation();

    var g = d3.select(this);
    var t = getTranslation(g.attr("transform"));

    d.origin = {
      x: d3.event.x - t[0],
      y: d3.event.y - t[1],
    }

    d3.select(this).classed("dragging", true);
  }

  function dragging(d) {
    d3.select(this)
      .attr("transform", "translate(" + (d3.event.x - d.origin.x) + "," + (d3.event.y - d.origin.y) + ")");
  }

  function dragEnded(d) {
    d3.select(this).classed("dragging", false);
    updateConnections();
  }

  function zoomed(g) {
    return function () {
      g.attr("transform", d3.event.transform);
    }
  }

})();
