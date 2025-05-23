import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Users, CheckCircle2, User } from "lucide-react";

// Import the StatCard component
import StatCard from "@/components/admin/StatCard";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("week");
  
  // Sample stats for demonstration
  const stats = [
    {
      title: "Total Candidates",
      value: "1,284",
      change: "+12.5%",
      icon: <Users className="h-6 w-6 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Pass Rate",
      value: "78.3%",
      change: "+4.2%",
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Avg. Score",
      value: "86.4",
      change: "+1.8%",
      icon: <BarChart className="h-6 w-6 text-white" />,
      color: "bg-purple-500"
    },
    {
      title: "Completion Rate",
      value: "92.7%",
      change: "-0.5%",
      icon: <PieChart className="h-6 w-6 text-white" />,
      color: "bg-amber-500"
    }
  ];
  
  // Sample recent candidates for table
  const recentCandidates = [
    { id: 1, name: "John Smith", email: "john@example.com", score: 92, stage: "Completed", date: "2025-05-22" },
    { id: 2, name: "Maria Garcia", email: "maria@example.com", score: 88, stage: "Stage 2", date: "2025-05-22" },
    { id: 3, name: "Alex Johnson", email: "alex@example.com", score: 74, stage: "Stage 1", date: "2025-05-21" },
    { id: 4, name: "Sarah Lee", email: "sarah@example.com", score: 95, stage: "Completed", date: "2025-05-21" },
    { id: 5, name: "Robert Chen", email: "robert@example.com", score: 82, stage: "Stage 2", date: "2025-05-20" }
  ];
  
  // Sample skills breakdown data
  const skillsData = [
    { skill: "Grammar", avg: 84 },
    { skill: "Vocabulary", avg: 78 },
    { skill: "Pronunciation", avg: 72 },
    { skill: "Fluency", avg: 81 },
    { skill: "Comprehension", avg: 88 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Overview of assessment statistics and candidate data
            </p>
          </div>
          <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeRange === "week" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeRange === "month" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange("year")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeRange === "year" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Main content area - charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - Assessment Completion Trends */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Assessment Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for chart - in a real app, use a charting library */}
              <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <LineChart className="h-16 w-16 text-gray-400" />
                <span className="ml-2 text-gray-500">Assessment trend chart would appear here</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Average Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsData.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <span className="text-sm text-gray-500">{skill.avg}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${skill.avg}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Candidates Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Recent Candidates</CardTitle>
              <button className="text-sm text-primary hover:text-primary/80">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Stage</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidates.map((candidate) => (
                    <tr 
                      key={candidate.id} 
                      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-6 py-4 font-medium">{candidate.name}</td>
                      <td className="px-6 py-4">{candidate.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          candidate.score >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {candidate.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.stage === "Completed" ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          candidate.stage === "Stage 2" ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">{candidate.date}</td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:text-primary/80 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;