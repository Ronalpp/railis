"use client"

import { useRef } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartData {
  month: string
  completed: number
  total: number
}

interface TaskCompletionChartProps {
  data: ChartData[]
}

export default function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartRef = useRef<ChartJS>(null)

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Tareas Creadas",
        data: data.map((item) => item.total),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Tareas Completadas",
        data: data.map((item) => item.completed),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  )
}

