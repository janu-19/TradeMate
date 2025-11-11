import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate colors dynamically
const generateColors = (count) => {
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(255, 99, 255, 0.8)',
    'rgba(99, 255, 132, 0.8)',
  ];
  
  const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
    'rgba(83, 102, 255, 1)',
    'rgba(255, 99, 255, 1)',
    'rgba(99, 255, 132, 1)',
  ];

  // Repeat colors if needed
  const bgColors = [];
  const bColors = [];
  for (let i = 0; i < count; i++) {
    bgColors.push(colors[i % colors.length]);
    bColors.push(borderColors[i % borderColors.length]);
  }
  
  return { bgColors, bColors };
};

export const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 10,
        font: {
          size: 10
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ₹${value.toFixed(2)}`;
        }
      }
    }
  }
};

export default function DoughnutChart({ watchlist }) {
  if (!watchlist || watchlist.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No watchlist data available</div>;
  }

  // Prepare data from watchlist
  const labels = watchlist.map((stock) => stock.name);
  const prices = watchlist.map((stock) => stock.price);
  const { bgColors, bColors } = generateColors(watchlist.length);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Stock Price',
        data: prices,
        backgroundColor: bgColors,
        borderColor: bColors,
        borderWidth: 2,
      },
    ],
  };

  return <Doughnut data={chartData} options={options} />;
}