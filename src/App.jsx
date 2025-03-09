import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Papa from "papaparse";
import "katex/dist/katex.min.css";
import katex from "katex";
import './App.css'

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [minMax, setMinMax] = useState(null);
  const [regressionLine, setRegressionLine] = useState(null);
  const [equation, setEquation] = useState("");
  const [predictionX, setPredictionX] = useState("");
  const [predictedY, setPredictedY] = useState(null);
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const parsedData = result.data
          .map((row) => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) }))
          .filter((point) => !isNaN(point.x) && !isNaN(point.y));

        if (parsedData.length > 0) {
          setData(parsedData);
          calculateRegression(parsedData);
          findMinMax(parsedData);
        }
      },
    });
  };

  const findMinMax = (data) => {
    const minX = Math.min(...data.map((d) => d.x));
    const maxX = Math.max(...data.map((d) => d.x));
    const minY = Math.min(...data.map((d) => d.y));
    const maxY = Math.max(...data.map((d) => d.y));
    setMinMax({ minX, maxX, minY, maxY });
  };

  const calculateRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    setSlope(slope);
    setIntercept(intercept);

    const interceptSymbol = intercept < 0 ? "-" : "+";

    let slopeSymbol = slope < 0 ? "-" : "";

    const formattedSlope = slopeSymbol + toFraction(slope) + "x";
    const formattedIntercept = intercept.toFixed(2) === "0.00" ? "" : ` ${interceptSymbol} ${toFraction(intercept)}`;

    setEquation(`y = ${formattedSlope}${formattedIntercept}`);

    const sortedX = data.map((d) => d.x).sort((a, b) => a - b);
    const regressionPoints = [
      { x: sortedX[0], y: slope * sortedX[0] + intercept },
      { x: sortedX[sortedX.length - 1], y: slope * sortedX[sortedX.length - 1] + intercept },
    ];
    setRegressionLine(regressionPoints);
  };

  const toFraction = (decimal) => {
    const tolerance = 1.0E-6;
    let numerator = 1;
    let denominator = 1;
    let fraction = numerator / denominator;

    while (Math.abs(fraction - decimal) > tolerance) {
      if (fraction < decimal) {
        numerator++;
      } else {
        denominator++;
        numerator = Math.round(decimal * denominator);
      }
      fraction = numerator / denominator;
    }

    if (numerator < 0) {
      numerator = -numerator;
    }

    return denominator === 1 ? numerator.toString() : `\\frac{${numerator}}{${denominator}}`;
  };

  const handlePrediction = () => {
    if (predictionX !== "") {
      const x = parseFloat(predictionX);
      const y = slope * x + intercept;
      setPredictedY(y);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">CSV Regression App - <a href="https://github.com/sfestacatenate/React_PWA_Linear_Regression" className="text-blue-500 hover:underline">Info</a></h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4 border p-2 cursor-pointer" />
      {equation && (
        <div
          className="text-lg font-semibold mt-4"
          dangerouslySetInnerHTML={{ __html: katex.renderToString(equation) }}
        />
      )}
      {minMax && (
        <div className="my-4 text-lg">
          <p><span className="font-semibold">Min X:</span> {minMax.minX}, <span className="font-semibold">Max X:</span> {minMax.maxX}</p>
          <p><span className="font-semibold">Min Y:</span> {minMax.minY}, <span className="font-semibold">Max Y:</span> {minMax.maxY}</p>
        </div>
      )}
      {data.length > 0 && (
        <div className="bg-white p-4 shadow-lg">
          <Line
            data={{
              datasets: [
                {
                  label: "Data Points",
                  data: data,
                  borderColor: "blue",
                  backgroundColor: "blue",
                  pointRadius: 5,
                  showLine: false,
                },
                regressionLine && {
                  label: "Regression Line",
                  data: regressionLine,
                  borderColor: "red",
                  borderWidth: 2,
                  fill: false,
                },
              ].filter(Boolean),
            }}
            options={{
              scales: {
                x: { type: "linear", position: "bottom", title: { display: true, text: "X Axis" } },
                y: { title: { display: true, text: "Y Axis" } }
              },
            }}
          />
        </div>
      )}
      {equation && (
        <div className="mt-6">
          <input
            type="number"
            placeholder="Inserisci X per previsione"
            value={predictionX}
            onChange={(e) => setPredictionX(e.target.value)}
            className="border p-2 mx-2"
          />
          <button onClick={handlePrediction} className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
            Predict Y
          </button>
          {predictedY !== null && <p className="mt-4 text-lg">
            <span className="font-semibold">Y expected:</span> {predictedY}
          </p>}
        </div>
      )}
    </div>
  );
};

export default App;

