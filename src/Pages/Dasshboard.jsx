import React, { useContext, useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getDatabase, ref, onValue } from "firebase/database";
import "chart.js/auto";
import { Context } from "../MainContext";
import { FaMehRollingEyes, FaSpinner } from "react-icons/fa";

const Dashboard = () => {
  // context
  const { isLoader, holdUserPlayData } = useContext(Context);

  // states
  const [barData, setBarData] = useState({
    labels: [],
    datasets: [],
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [],
  });

  const [doughnutData, setDoughnutData] = useState({
    labels: ["Correct", "Incorrect", "Attempted"],
    datasets: [],
  });

  const [recentActivities, setRecentActivities] = useState([]);

  // options for charts
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    if (holdUserPlayData.length > 0) {
      // Process data for bar chart
      const barChartData = { labels: [], datasets: [] };
      const barDatasetData = [];

      // Process data for doughnut chart
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let attemptedQuizes = 0;

      // Process data for line chart
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthlyAttempts = Array(12).fill(0);

      // Process data for recent activities
      const activities = [];

      holdUserPlayData.forEach((playData) => {
        // Bar chart data
        const category = playData.categoryDetails.cateCategory;
        const totalMarks = playData.totalMarks;
        if (barChartData.labels.includes(category)) {
          const index = barChartData.labels.indexOf(category);
          barDatasetData[index] += totalMarks;
        } else {
          barChartData.labels.push(category);
          barDatasetData.push(totalMarks);
        }

        // Doughnut chart data
        correctAnswers += playData.correctAnswers;
        wrongAnswers += playData.wrongAnswers;
        attemptedQuizes += playData.attemptedQuizes;

        // Line chart data
        const date = new Date(playData.time);
        const monthIndex = date.getMonth();
        monthlyAttempts[monthIndex] += 1;

        // Recent activities data
        const activity = `Attempted ${playData.attemptedQuizes} quizzes in ${category} category.`;
        activities.push(activity);
      });

      // Update state for bar chart
      barChartData.datasets = [
        {
          label: "Average Scores",
          data: barDatasetData,
          backgroundColor: "#e74c3c",
        },
      ];
      setBarData(barChartData);

      // Update state for doughnut chart
      setDoughnutData({
        labels: ["Correct", "Incorrect", "Attempted"],
        datasets: [
          {
            data: [correctAnswers, wrongAnswers, attemptedQuizes],
            backgroundColor: ["#FF6384", "#D83D3A", "#FFCE56"],
          },
        ],
      });

      // Update state for line chart
      setLineData({
        labels: months.slice(0, new Date().getMonth() + 1),
        datasets: [
          {
            label: "Quiz Attempts",
            data: monthlyAttempts.slice(0, new Date().getMonth() + 1),
            borderColor: "#ec4899",
            fill: false,
          },
        ],
      });

      // Update state for recent activities
      setRecentActivities(activities);
    }
  }, [holdUserPlayData]);

  console.log(holdUserPlayData);

  return isLoader ? (
    <div className="items-center justify-center py-9 order-[2] flex">
      <FaSpinner className="text-gray-300 text-[2rem] block animate-spin" />
    </div>
  ) : holdUserPlayData != "" ? (
    <div className="max-w-[1200px] mx-auto min-h-screen p-8">
      <h1 className="bg-gray-800 text-gray-100 text-[2rem] font-black p-5 rounded-md">
        Quizzes
      </h1>
      <div className="my-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Average Scores</h2>
          <Bar data={barData} options={options} />
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Question Distribution</h2>
          <Doughnut data={doughnutData} />
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Monthly Quiz Attempts</h2>
          <Line data={lineData} options={options} />
        </div>
      </div>
      <div className="bg-slate-800 text-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        <ul>
          {recentActivities.map((activity, index) => (
            <li key={index} className="mb-2 text-gray-200">
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div className="h-[50vh] py-9 flex flex-col items-center justify-center gap-2 text-[1.2rem] text-gray-400 font-medium">
      <img
        src="https://raw.githubusercontent.com/dev-aditya99/Quizem/ef0da05924d4490564fb60d1ede07686588f355e/src/assets/svgs/undraw_empty_re_opql.svg"
        alt="404"
        className="my-5 w-full h-full object-contain"
      />
      No enough data to show analytics
    </div>
  );
};

export default Dashboard;
