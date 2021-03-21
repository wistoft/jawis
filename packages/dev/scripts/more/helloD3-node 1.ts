import D3Node from "d3-node";

{
  const d3n = new D3Node(); // initializes D3 with container element

  d3n.createSVG(10, 20).append("g"); // create SVG w/ 'g' tag and width/height

  console.log(d3n.html());
  console.log(d3n.svgString());
}

{
  const options = {
    selector: "#chart",
    container: '<div id="container"><div id="chart"></div></div>',
  };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  d3.select(d3n.document.querySelector("#chart")).append("span");

  console.log(d3n.html());
  // console.log(d3n.svgString()); //nothing
}

{
  const options = {
    selector: "#chart",
    container: '<div id="container"><div id="chart"></div></div>',
  };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  d3.select(d3n.document.querySelector("#chart")).append("span");

  console.log(d3n.html());
  console.log(d3n.svgString());
}
