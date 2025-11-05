import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// register once
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReasonBar({ dataArr = [] }) {
  // guard if no data
  const labels = dataArr.map((d) => d.reason || "(No Reason)");
  const dataset = dataArr.map((d) => Number(d.quantity) || 0);

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title className="mb-3">Calls by Reason</Card.Title>

        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Calls",
                data: dataset,
                backgroundColor: "rgba(13,110,253,.6)", // Bootstrap primary-ish
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.parsed.y} call${ctx.parsed.y === 1 ? "" : "s"}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { color: "rgba(0,0,0,.05)" },
              },
            },
          }}
          height={360}
        />
      </Card.Body>
    </Card>
  );
}
