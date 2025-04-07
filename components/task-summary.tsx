import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Clock, PlayCircle } from "lucide-react"
import Link from "next/link"

interface TaskSummaryProps {
  title: string
  count: number
  status: "pending" | "in_progress" | "completed"
}

export default function TaskSummary({ title, count, status }: TaskSummaryProps) {
  const getIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "in_progress":
        return <PlayCircle className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckSquare className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "in_progress":
        return "text-blue-500"
      case "completed":
        return "text-green-500"
      default:
        return ""
    }
  }

  return (
    <Link href={`/dashboard/tasks?status=${status}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {getIcon()}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            <span className={getStatusColor()}>{count}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

