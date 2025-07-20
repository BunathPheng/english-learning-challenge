"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, CalendarDays } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { getTodayDateString, formatDateDisplay } from "@/components/utils/date-utils"

const DAILY_TASKS = [
  { id: "tenses", description: "Review 12 tenses in English grammar", duration: "12 min" },
  {
    id: "newWords",
    description: "Learn 3 new English words, their usage, and grammar-related examples",
    duration: "12 min",
  },
  { id: "speakAI", description: "Speak with AI on one topic", duration: "12 min" },
  { id: "grammarExercise", description: "Do grammar exercises or homework", duration: "12 min" },
  { id: "media", description: "Watch English movies, songs, or short videos", duration: "12 min" },
]

// Type for current day's task status (for all daily tasks)
type CurrentDayTaskStatus = Record<string, boolean> // Key: taskId (e.g., "tenses"), Value: boolean

// Type for monthly history record
interface DailyRecord {
  tasks: CurrentDayTaskStatus // Store the status of all daily tasks for this date
  percentage: number // Calculated based on completed tasks for this date
}

type MonthlyHistory = Record<string, DailyRecord> // Key: YYYY-MM-DD, Value: DailyRecord

export default function EnglishLearningChallenge() {
  const { toast } = useToast()

  const [currentDayTaskStatus, setCurrentDayTaskStatus] = useState<CurrentDayTaskStatus>(
    DAILY_TASKS.reduce((acc, task) => ({ ...acc, [task.id]: false }), {}),
  )
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory>({})
  const [lastDailyResetDate, setLastDailyResetDate] = useState<string | null>(null)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [overallProgress, setOverallProgress] = useState(0)
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null)
  const [challengeEndDate, setChallengeEndDate] = useState<string | null>(null)
  const [totalCompletedChallengeTasks, setTotalCompletedChallengeTasks] = useState(0)
  const [totalPossibleChallengeTasks, setTotalPossibleChallengeTasks] = useState(0)
  const [daysIntoChallenge, setDaysIntoChallenge] = useState(0)
  const [totalChallengeDays, setTotalChallengeDays] = useState(0)

  const todayDate = getTodayDateString()

  // Calculate daily percentage based on currentDayTaskStatus
  const calculateDailyPercentage = (tasksStatus: CurrentDayTaskStatus): number => {
    const completedTasks = Object.values(tasksStatus).filter(Boolean).length
    return DAILY_TASKS.length > 0 ? Math.round((completedTasks / DAILY_TASKS.length) * 100) : 0
  }

  // Calculate overall challenge progress and return detailed metrics
  const calculateOverallChallengeProgress = (
    history: MonthlyHistory,
    startDate: string | null,
    endDate: string | null,
  ): {
    percentage: number
    completedTasks: number
    possibleTasks: number
    daysInto: number
    totalDays: number
  } => {
    if (!startDate || !endDate) {
      return { percentage: 0, completedTasks: 0, possibleTasks: 0, daysInto: 0, totalDays: 0 }
    }

    let totalCompletedTasks = 0
    let totalPossibleTasks = 0
    let daysCounted = 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date(todayDate)

    // Determine the effective end date for calculation (either challenge end or today, whichever is earlier)
    const effectiveEndDate = today < end ? today : end

    // Calculate total challenge duration in days
    const diffTimeTotal = Math.abs(end.getTime() - start.getTime())
    const totalDaysInChallenge = Math.ceil(diffTimeTotal / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end day

    // Iterate through dates from start to effectiveEndDate
    const currentDate = new Date(start)
    while (currentDate <= effectiveEndDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      totalPossibleTasks += DAILY_TASKS.length // Each day has DAILY_TASKS.length possible tasks
      daysCounted++

      if (history[dateString]) {
        totalCompletedTasks += Object.values(history[dateString].tasks).filter(Boolean).length
      }
      currentDate.setDate(currentDate.getDate() + 1) // Move to next day
    }

    const percentage = totalPossibleTasks > 0 ? Math.round((totalCompletedTasks / totalPossibleTasks) * 100) : 0

    return {
      percentage,
      completedTasks: totalCompletedTasks,
      possibleTasks: totalPossibleTasks,
      daysInto: daysCounted,
      totalDays: totalDaysInChallenge,
    }
  }

  // Load data from localStorage on initial render and handle daily/challenge reset
  useEffect(() => {
    const savedCurrentDayTaskStatus = localStorage.getItem("englishChallengeCurrentDayTaskStatus")
    const savedMonthlyHistory = localStorage.getItem("englishChallengeMonthlyHistory")
    const savedLastDailyResetDate = localStorage.getItem("englishChallengeLastDailyResetDate")
    const savedChallengeStartDate = localStorage.getItem("englishChallengeStartDate")

    const initialCurrentDayTaskStatus: CurrentDayTaskStatus = DAILY_TASKS.reduce(
      (acc, task) => ({ ...acc, [task.id]: false }),
      {},
    )
    let initialMonthlyHistory: MonthlyHistory = {}

    if (savedMonthlyHistory) {
      initialMonthlyHistory = JSON.parse(savedMonthlyHistory)
    }

    // Initialize or load challenge start date
    let currentChallengeStartDate = savedChallengeStartDate
    if (!currentChallengeStartDate) {
      currentChallengeStartDate = todayDate
      localStorage.setItem("englishChallengeStartDate", currentChallengeStartDate)
    }
    setChallengeStartDate(currentChallengeStartDate)

    // Calculate challenge end date (2 months from start date)
    const start = new Date(currentChallengeStartDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 2)
    const calculatedChallengeEndDate = end.toISOString().split("T")[0]
    setChallengeEndDate(calculatedChallengeEndDate)

    // Handle daily reset
    if (savedLastDailyResetDate !== todayDate) {
      setCurrentDayTaskStatus(initialCurrentDayTaskStatus)
      setLastDailyResetDate(todayDate)
      localStorage.setItem("englishChallengeCurrentDayTaskStatus", JSON.stringify(initialCurrentDayTaskStatus))
      localStorage.setItem("englishChallengeLastDailyResetDate", todayDate)
      toast({
        title: "New Day!",
        description: "Your daily tasks have been reset.",
      })
    } else if (savedCurrentDayTaskStatus) {
      setCurrentDayTaskStatus(JSON.parse(savedCurrentDayTaskStatus))
    }

    // Initialize today's record in monthly history if it doesn't exist
    if (!initialMonthlyHistory[todayDate]) {
      initialMonthlyHistory[todayDate] = {
        tasks: initialCurrentDayTaskStatus,
        percentage: calculateDailyPercentage(initialCurrentDayTaskStatus),
      }
    }
    setMonthlyHistory(initialMonthlyHistory)

    // Calculate and set all overall progress metrics
    const { percentage, completedTasks, possibleTasks, daysInto, totalDays } = calculateOverallChallengeProgress(
      initialMonthlyHistory,
      currentChallengeStartDate,
      calculatedChallengeEndDate,
    )
    setOverallProgress(percentage)
    setTotalCompletedChallengeTasks(completedTasks)
    setTotalPossibleChallengeTasks(possibleTasks)
    setDaysIntoChallenge(daysInto)
    setTotalChallengeDays(totalDays)
  }, [todayDate, toast])

  // Save data to localStorage whenever currentDayTaskStatus or monthlyHistory changes
  useEffect(() => {
    if (Object.keys(currentDayTaskStatus).length > 0) {
      localStorage.setItem("englishChallengeCurrentDayTaskStatus", JSON.stringify(currentDayTaskStatus))

      const currentDayPercentage = calculateDailyPercentage(currentDayTaskStatus)

      setMonthlyHistory((prevMonthlyHistory) => {
        const updatedMonthlyHistory = {
          ...prevMonthlyHistory,
          [todayDate]: {
            tasks: currentDayTaskStatus,
            percentage: currentDayPercentage,
          },
        }
        localStorage.setItem("englishChallengeMonthlyProgress", JSON.stringify(updatedMonthlyHistory))
        // Recalculate all overall progress metrics with the latest history and dates
        const { percentage, completedTasks, possibleTasks, daysInto, totalDays } = calculateOverallChallengeProgress(
          updatedMonthlyHistory,
          challengeStartDate,
          challengeEndDate,
        )
        setOverallProgress(percentage)
        setTotalCompletedChallengeTasks(completedTasks)
        setTotalPossibleChallengeTasks(possibleTasks)
        setDaysIntoChallenge(daysInto)
        setTotalChallengeDays(totalDays)
        return updatedMonthlyHistory
      })
    }
  }, [currentDayTaskStatus, todayDate, challengeStartDate, challengeEndDate])

  const handleCheckboxChange = (taskId: string, checked: boolean) => {
    setCurrentDayTaskStatus((prevStatus) => {
      const newStatus = { ...prevStatus, [taskId]: checked }
      toast({
        title: checked ? "Task Completed!" : "Task Unchecked",
        description: `Task "${DAILY_TASKS.find((t) => t.id === taskId)?.description}" is now ${checked ? "complete" : "incomplete"}.`,
        variant: checked ? "default" : "destructive",
      })
      return newStatus
    })
  }

  const handleResetDailyTasks = () => {
    const resetStatus = DAILY_TASKS.reduce((acc, task) => ({ ...acc, [task.id]: false }), {})
    setCurrentDayTaskStatus(resetStatus)
    setLastDailyResetDate(todayDate)
    localStorage.setItem("englishChallengeLastDailyResetDate", todayDate)
    toast({
      title: "Daily Tasks Reset!",
      description: "All tasks for today have been reset.",
    })
  }

  const handleResetChallenge = () => {
    if (confirm("Are you sure you want to reset the entire 2-month challenge? This will clear all your progress.")) {
      localStorage.removeItem("englishChallengeCurrentDayTaskStatus")
      localStorage.removeItem("englishChallengeMonthlyProgress")
      localStorage.removeItem("englishChallengeLastDailyResetDate")
      localStorage.removeItem("englishChallengeStartDate")

      // Reset states to initial values
      setCurrentDayTaskStatus(DAILY_TASKS.reduce((acc, task) => ({ ...acc, [task.id]: false }), {}))
      setMonthlyHistory({})
      setLastDailyResetDate(null)
      setExpandedDates({})
      setOverallProgress(0)
      setChallengeStartDate(null) // Will be re-initialized to todayDate by useEffect
      setChallengeEndDate(null) // Will be re-calculated by useEffect
      setTotalCompletedChallengeTasks(0)
      setTotalPossibleChallengeTasks(0)
      setDaysIntoChallenge(0)
      setTotalChallengeDays(0)

      toast({
        title: "Challenge Reset!",
        description: "Your 2-month English learning challenge has been reset.",
      })
      // Force a re-render to re-initialize the challenge start date
      window.location.reload()
    }
  }

  const toggleExpand = (date: string) => {
    setExpandedDates((prevExpandedDates) => ({
      ...prevExpandedDates,
      [date]: !prevExpandedDates[date],
    }))
  }

  // Sort dates for monthly history display (most recent first)
  const sortedHistoryDates = Object.keys(monthlyHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <>
      {/* New Challenge Overview Card */}
      <Card className="w-full max-w-3xl rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl mb-8 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4 px-6 text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My 2-Month English Learning Challenge
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mt-2">
            <CalendarDays className="h-4 w-4" />
            {challengeStartDate && challengeEndDate ? (
              <span>
                {formatDateDisplay(challengeStartDate)} - {formatDateDisplay(challengeEndDate)}
              </span>
            ) : (
              <span>Loading challenge dates...</span>
            )}
          </div>
          <p className="text-md text-gray-700 mt-2">Overall Progress: {overallProgress}%</p>
          <div className="text-sm text-gray-600 mt-1">
            {daysIntoChallenge} / {totalChallengeDays} days completed
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {totalCompletedChallengeTasks} / {totalPossibleChallengeTasks} tasks completed
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Progress value={overallProgress} className="w-full h-3 bg-blue-500 rounded-full" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div className="mt-6 text-center">
            <Button
              onClick={handleResetChallenge}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset 2-Month Challenge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Learning Checklist Card (Existing) */}
      <Card className="w-full max-w-3xl rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl mb-8 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="h-6 w-6 text-blue-600" />
              Daily Learning Checklist{" "}
              <span className="text-base font-medium text-gray-500 hidden sm:inline-block">(Every day)</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetDailyTasks}
              aria-label="Reset Daily Tasks"
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_auto] sm:grid-cols-[1fr_100px_200px] gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm sm:text-base">
            <div>Task</div>
            <div>Time</div>
            <div className="text-right">Status</div>
          </div>

          {/* Table Rows */}
          {DAILY_TASKS.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-[1fr_80px_auto] sm:grid-cols-[1fr_100px_200px] gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200`}
            >
              <div className="text-gray-700 text-sm sm:text-base">{item.description}</div>
              <div className="flex items-center gap-1 text-gray-600 text-sm sm:text-base">
                <Clock className="h-4 w-4" />
                {item.duration}
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Label
                  htmlFor={`task-${item.id}`}
                  className={`text-sm sm:text-base cursor-pointer hidden sm:inline-block ${currentDayTaskStatus[item.id] ? "text-green-600" : "text-gray-500"}`}
                >
                  {currentDayTaskStatus[item.id] ? "Complete" : "Not Complete"}
                </Label>
                <Checkbox
                  id={`task-${item.id}`}
                  checked={currentDayTaskStatus[item.id]}
                  onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                  className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                />
                {currentDayTaskStatus[item.id] && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monthly Progress Summary (Existing) */}
      <Card className="w-full max-w-3xl rounded-2xl shadow-xl border border-gray-100 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Monthly Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-gray-700 mb-6 text-center leading-relaxed">
            Overview of your daily task completion rates. Click on a day to see details.
          </p>
          <Separator className="my-6 bg-gray-200" />
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {sortedHistoryDates.length === 0 ? (
              <p className="text-center text-gray-500">No daily records yet.</p>
            ) : (
              sortedHistoryDates.map((date) => {
                const record = monthlyHistory[date]
                const isExpanded = expandedDates[date]
                return (
                  <div
                    key={date}
                    className="flex flex-col p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 cursor-pointer"
                    onClick={() => toggleExpand(date)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-800">
                        {formatDateDisplay(date)}: <span className="text-gray-600 text-sm">Daily Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-base sm:text-lg flex items-center gap-1 ${record.percentage === 100 ? "text-green-600" : "text-red-600"}`}
                        >
                          {record.percentage}%{" "}
                          {record.percentage === 100 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Task Breakdown:</p>
                        {DAILY_TASKS.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm text-gray-700">
                            <span className="flex items-center gap-2">
                              {record.tasks[task.id] ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {task.description}
                            </span>
                            <span className="text-gray-500">{task.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
