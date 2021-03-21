import { outHtml } from "^jab-node";
import * as d3 from "d3";
import { Selection } from "d3";
import D3Node from "d3-node";

const d3n = new D3Node({
  d3Module: d3,
  styles: `
  .bar rect {
    fill: steelblue;
  }
  .bar text {
    fill: #fff;
    font: 10px sans-serif;
  }`,
});

const data = d3.range(1000).map(d3.randomBates(10));

const formatCount = d3.format(",.0f");

const svgWidth = 600;
const svgHeight = 500;

const margin = { top: 10, right: 30, bottom: 30, left: 30 };

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

//
// d3
//

const x = d3.scaleLinear().rangeRound([0, width]);

const bins = d3
  .histogram()
  .domain(x.domain() as [number, number])
  .thresholds(x.ticks(20))(data);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(bins, (d) => d.length) as number])
  .range([height, 0]);

const svg = d3n
  .createSVG(svgWidth, svgHeight)
  .append("g")
  .attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  ) as Selection<any, undefined, null, undefined>;

const bar = svg
  .selectAll(".bar")
  .data(bins)
  .enter()
  .append("g")
  .attr("class", "bar")
  .attr(
    "transform",
    (d) => "translate(" + x(d.x0 as number) + "," + y(d.length as number) + ")"
  );

const xBinsX1 = x(bins[0].x1 as number) as number;
const xBinsX0 = x(bins[0].x0 as number) as number;

bar
  .append("rect")
  .attr("x", 1)
  .attr("width", xBinsX1 - xBinsX0 - 1)
  .attr("height", (d) => height - (y(d.length) as number));

bar
  .append("text")
  .attr("dy", ".75em")
  .attr("y", 6)
  .attr("x", (xBinsX1 - xBinsX0) / 2)
  .attr("text-anchor", "middle")
  .text((d) => formatCount(d.length));

svg
  .append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

outHtml(d3n.svgString());
