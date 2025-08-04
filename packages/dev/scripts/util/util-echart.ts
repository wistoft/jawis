import { outHtml } from "^jagoc/jago-out";
import { range } from "^jab/util";

const echarts = require("echarts");

export type CategoryLineChartData = {
  categories: (string | number)[];
  dataset: { name: string; data: number[] }[];
};

/**
 *
 */
export const outHorizontalBar = (dataset: [number, string][]) => {
  const lineChart = echarts.init(null as any, null as any, {
    renderer: "svg",
    ssr: true,
    width: 1200,
    height: 800,
  });

  lineChart.setOption({
    dataset: {
      source: dataset.reverse(), //reverses, because that makes better sense.
    },
    xAxis: {},
    yAxis: { type: "category" },
    series: [
      {
        type: "bar",
        encode: {}, //does some magic.
      },
    ],
  });

  outHtml(lineChart.renderToSVGString());

  lineChart.dispose();
};

/**
 *
 */
export const outImplicitCategoryLineChart = (
  dataset: CategoryLineChartData["dataset"]
) => {
  if (dataset.length === 0) {
    throw new Error("No data given.");
  }

  const max = dataset.reduce<number>(
    (acc, cur) => Math.max(acc, cur.data.length),
    0
  );

  const categories = range(max, 1, 1);

  outCategoryLineChart({ categories, dataset });
};

/**
 *
 */
export const outCategoryLineChart = (data: CategoryLineChartData) => {
  const lineChart = echarts.init(null as any, null as any, {
    renderer: "svg",
    ssr: true,
    width: 1200,
    height: 600,
  });

  const mappedDataset = data.dataset.map((elm) => ({
    ...elm,
    type: "line",
    smooth: true,
  }));

  lineChart.setOption({
    legend: {},
    xAxis: {
      type: "category",
      data: data.categories,
    },
    yAxis: {
      type: "value",
    },
    series: mappedDataset,
  });

  outHtml(lineChart.renderToSVGString());

  lineChart.dispose();
};

/**
 *
 */
export const outLineChartSimple = (data: Map<number, number>) =>
  outLineChart([{ data }]);

/**
 *
 */
export const outLineChart = (
  data: { name?: string; data: Map<number, number> }[]
) => {
  const lineChart = echarts.init(null as any, null as any, {
    renderer: "svg",
    ssr: true,
    width: 1200,
    height: 600,
  });

  const series = data.map((elm, index) => ({
    type: "line",
    name: elm.name,
    data: Array.from(elm.data.entries()),
  }));

  lineChart.setOption({
    legend: {},
    xAxis: {},
    yAxis: {},
    series,
  });

  outHtml(lineChart.renderToSVGString());

  lineChart.dispose();
};
