/**
 * Мок для react-chartjs-2
 * Используется в тестах для предотвращения зависания из-за Canvas API
 */
import React from "react";

export const Line = ({ data, options }: any) => (
  <div data-testid="mock-line-chart" data-chart-type="line">
    <div data-testid="chart-labels">{JSON.stringify(data?.labels || [])}</div>
    <div data-testid="chart-datasets">{JSON.stringify(data?.datasets || [])}</div>
  </div>
);

export const Bar = ({ data, options }: any) => (
  <div data-testid="mock-bar-chart" data-chart-type="bar">
    <div data-testid="chart-labels">{JSON.stringify(data?.labels || [])}</div>
    <div data-testid="chart-datasets">{JSON.stringify(data?.datasets || [])}</div>
  </div>
);

export const Doughnut = ({ data, options }: any) => (
  <div data-testid="mock-doughnut-chart" data-chart-type="doughnut">
    <div data-testid="chart-labels">{JSON.stringify(data?.labels || [])}</div>
    <div data-testid="chart-datasets">{JSON.stringify(data?.datasets || [])}</div>
  </div>
);

export const Pie = ({ data, options }: any) => (
  <div data-testid="mock-pie-chart" data-chart-type="pie">
    <div data-testid="chart-labels">{JSON.stringify(data?.labels || [])}</div>
    <div data-testid="chart-datasets">{JSON.stringify(data?.datasets || [])}</div>
  </div>
);
