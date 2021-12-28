import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 *
 */
export const HelloRecharts = () => {
  const data = [
    { name: "A", x: 40, y: 240 },
    { name: "B", x: 140, y: 1240 },
    { name: "C", x: 400, y: 2400 },
  ];

  return (
    <>
      <LineChart width={400} height={400} data={data}>
        <Line type="monotone" dataKey="x" stroke="#8884d8" />

        <XAxis />
        <YAxis />
        <CartesianGrid stroke="#f5f5f5" strokeDasharray="5 5" />
      </LineChart>

      <LineChart
        width={400}
        height={400}
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <Line type="monotone" dataKey="x" stroke="#ff7300" />
        <Line type="monotone" dataKey="y" stroke="#387908" />

        <Tooltip />
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid stroke="#f5f5f5" />
      </LineChart>
    </>
  );
};

HelloRecharts.displayName = "HelloRecharts";
