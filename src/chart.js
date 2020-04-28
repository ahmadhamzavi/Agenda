var selectedNodeClass="selectedNode";


var calculateRadius = function (id, size) {
  if (!size) size = 10;
  var children = agenda.nodes.filter((x) => x.parent === id);
  children.forEach((child) => {
    size += child.group + calculateRadius(child.id);
  });
  return size;
};


var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20c);
var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3.forceLink().id(function (d) {
      return d.id;
    })
  )
  .force(
    "charge",
    d3.forceManyBody().strength(-140).distanceMax(50).distanceMin(5)
  )
  .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(agenda.links)
  .enter()
  .append("line")
  .attr("stroke-width", 2)
  .style("stroke", function (d) {
    var source = agenda.nodes.filter((x) => x.id === d.source);
    console.log("s:", source);
    if (source[0].passed) {
      return "LightSeaGreen";
    } else {
      return "red";
    }
  });

var node = svg
  .append("g")

  .attr("class", "nodes")
  .selectAll("circle")
  .data(agenda.nodes)
  .enter()
  .append("circle")
  .attr("r", 5)
  .attr("fill", function (d) {
    if (d.passed) return "green";
    return "red";
  })
  .on("click", function (d) {
    console.log(d3.selectAll("circle"));
    d3.selectAll("circle")._groups[0].forEach(circle => {
      d3.select(circle).node().classList.remove(selectedNodeClass);
    });
    
    d3.select(this).node().classList.add(selectedNodeClass);
  })
  .call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

var text = svg
  .append("g")
  .attr("class", "texts")
  .selectAll("text")
  .data(agenda.nodes)
  .enter()
  .append("text")
  .attr("font-size", 7)
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central")
  .attr("fill", function (d) {
    return "red";
  })
  .text(function (d) {
    return d.id + " " + calculateRadius(d.id) / 20;
  })
  .call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

var passedIcon = svg
  .append("g")
  .attr("class", "texts")
  .selectAll("text")
  .data(agenda.nodes.filter((x) => x.passed))
  .enter()
  .append("text")
  .attr("font-family", "FontAwesome")
  .attr("font-size", 5)
  .attr("fill", function (d) {
    return "green";
  })
  .text(function (d) {
    return "\uf00c";
  })
  .call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );
simulation.nodes(agenda.nodes).on("tick", ticked);

simulation.force("link").links(agenda.links);

function ticked() {
  link
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

  node
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });

  text
    .attr("x", function (d) {
      return d.x - 10;
    })
    .attr("y", function (d) {
      return d.y + 10;
    });
  passedIcon
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y - 5;
    });
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
