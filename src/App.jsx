import { useState, useEffect } from 'react'
import * as d3 from 'd3';
import './App.css'

function App() {
  const [myData, setMyData] = useState('');
  const [load, setLoad] = useState(false);

  const w = 1600;
  const h = 600;
  const padding = 60;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const colors = ['red', 'orange', 'yellow', 'lightblue', 'blue'];

  const handleMouseover = (e, d, i) => {
    d3.select("#tooltip")
      .style("display", "inline")
      .attr("data-year", d.year)
      .style("left", e.pageX + 20 + "px")
      .style("top", e.pageY - 15 + "px")
      .html(() => {
        return '<div>' + d.year + ' - ' + months[d.month-1] + '</div>'
                + '<div>' + Number(myData.baseTemperature + d.variance).toFixed(1) + "℃" +'</div>'
                + '<div>' + d.variance.toFixed(1) + "℃" + '</div>'
      })
  }

  const handleMouseout = (d, i) => {
    d3.select("#tooltip")
      .style("display", "none");
  }

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
      .then(res => res.json())
      .then(data => setMyData(data))
      .then(() => setLoad(true))
  }, [0]);

  useEffect(() => {
    if (load) {
      const years = myData.monthlyVariance.map((d) => d.year);

      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      //xScale xAxis
      const xScale = d3.scaleBand()
        .domain(years)
        .range([padding, w - padding])
        .padding(0);

      const xAxis = d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter((year) => year % 10 === 0))
        .tickFormat((d) => {
          let date = new Date(0);
          date.setUTCFullYear(d);
          let format = d3.utcFormat('%Y');
          return format(date);
        })
        .tickSize(10, 1);

      svg.append("g")
        .attr("transform", "translate(0, " + (h - padding) + ")")
        .attr("id", "x-axis")
        .call(xAxis);

      //yScale yAxis
      const yScale = d3.scaleBand()
        .domain(months)
        .range([h - padding, padding]);

      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
        .attr("transform", "translate(" + (padding) + ", 0)")
        .attr("id", "y-axis")
        .call(yAxis);

      //tempScale tempAxis
      const tempScale = d3.scaleLinear()
        .domain(d3.extent(myData.monthlyVariance, (d) => myData.baseTemperature + d.variance))
        .range([0, 600]);

      const tempAxis = d3.axisBottom(tempScale);

      tempAxis.ticks(15);

      const tempSvg = d3.select("#legend")
        .append("svg")
        .attr("width", 600)
        .attr("height", 50);

      tempSvg.append("g")
        .attr("transform", "translate(0, " + 20 + ")")
        .attr("id", "tempSvg")
        .call(tempAxis);

      //Render the heat map
      svg.selectAll("rect")
        .data(myData.monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => d.month - 1)
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => myData.baseTemperature + Number(d.variance.toFixed(2)))
        .attr("fill", (d) => {
          let temp = myData.baseTemperature + Number(d.variance.toFixed(2));
          if (temp <= 4) {
            return "blue";
          } else if (temp > 4 && temp <= 6) {
            return "lightblue";
          } else if (temp >= 6 && temp <= 8) {
            return "yellow";
          } else if (temp > 8 && temp <= 10) {
            return "orange";
          } else if (temp > 10) {
            return "red";
          }
        })
        .attr("x", (d) => xScale(d.year))
        .attr("y", (d) => yScale(months[d.month - 1]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .on("mouseover", (e, d, i) => {
          handleMouseover(e, d, i);
        })
        .on("mouseout", (d, i) => handleMouseout(d, i));

      //Render the temps
      tempSvg.selectAll("rect")
        .data(myData.monthlyVariance)
        .enter()
        .append("rect")
        .attr("x", (d) => tempScale(myData.baseTemperature + d.variance))
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d) => {
          let temp = myData.baseTemperature + Number(d.variance.toFixed(2));
          if (temp <= 4) {
            return "blue";
          } else if (temp > 4 && temp <= 6) {
            return "lightblue";
          } else if (temp >= 6 && temp <= 8) {
            return "yellow";
          } else if (temp > 8 && temp <= 10) {
            return "orange";
          } else if (temp > 10) {
            return "red";
          }
        })
    }
  }, [load]);

  console.log(myData);

  return load ? (
    <div id="App">
      <h1 id="title">Heat Map</h1>
      <div id="description">{`1753 - 2015 baseTemperature: ${myData.baseTemperature} ℃`}</div>
      <div id="chart">
        <div id="tooltip"></div>
      <legend id="legend" className="temps"></legend>
      </div>
      <div>Created by <a href="https://github.com/DinosMpo/freecodecamp-d3-heat-map" target="_blank" rel="noreferrer">DinosMpo</a></div>
    </div>
  )
    :
    (
      <div>Loading</div>
    )
}

export default App
