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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// --- color helpers (stable color per reason) ---
function hashHue(str) {
  // simple stable hash → 0..359
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 360;
  }
  return h;
}
function colorForKey(key, alpha = 0.75) {
  const hue = hashHue(key || "(No Reason)");
  // tweak saturation/lightness for a Bootstrap-ish vibe
  return `hsla(${hue}, 65%, 55%, ${alpha})`;
}
function borderForKey(key) {
  const hue = hashHue(key || "(No Reason)");
  return `hsl(${hue}, 70%, 40%)`;
}

export default function ReasonBar({ dataArr = [] }) {
  const labels = dataArr.map((d) => d.reason || "(No Reason)");
  const values = dataArr.map((d) => Number(d.quantity) || 0);

  const backgrounds = labels.map((l) => colorForKey(l, 0.75));
  const borders = labels.map((l) => borderForKey(l));
  const hovers = labels.map((l) => colorForKey(l, 0.9));

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
                data: values,
                backgroundColor: backgrounds,
                borderColor: borders,
                hoverBackgroundColor: hovers,
                borderWidth: 1,
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
                  label: (ctx) =>
                    ` ${ctx.formattedValue} call${Number(ctx.parsed.y) === 1 ? "" : "s"}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { autoSkip: true, maxRotation: 45 },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { color: "rgba(0,0,0,.06)" },
              },
            },
          }}
          height={360}
        />
      </Card.Body>
    </Card>
  );
}
