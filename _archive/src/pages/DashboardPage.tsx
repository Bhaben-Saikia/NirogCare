import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, Heart, Calendar, TrendingUp, Users, Shield, Phone, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const healthMetrics = {
    heartRate: { value: 72, unit: 'bpm', status: 'normal', trend: 'stable' },
    bloodPressure: { value: '120/80', unit: 'mmHg', status: 'normal', trend: 'stable' },
    weight: { value: 70, unit: 'kg', status: 'normal', trend: 'down' },
    steps: { value: 8432, unit: 'steps', status: 'good', trend: 'up' }
  };

  const recentActivities = [
    { id: 1, type: 'medication', name: 'Vitamin D', time: '2 hours ago', completed: true },
    { id: 2, type: 'exercise', name: 'Morning Walk', time: '6 hours ago', completed: true },
    { id: 3, type: 'water', name: 'Water Intake', time: '1 hour ago', completed: false },
    { id: 4, type: 'sleep', name: 'Sleep Tracking', time: 'Yesterday', completed: true }
  ];

  const upcomingReminders = [
    { id: 1, name: 'Blood Pressure Medicine', time: '8:00 PM', type: 'medication' },
    { id: 2, name: 'Doctor Appointment', time: 'Tomorrow, 10:00 AM', type: 'appointment' },
    { id: 3, name: 'Health Checkup', time: 'Friday, 2:00 PM', type: 'checkup' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Health Dashboard</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Day</Button>
              <Button variant="outline" size="sm">Week</Button>
              <Button size="sm">Month</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back, John!</h2>
            <p className="text-muted-foreground">Here's your health overview for today</p>
          </div>

          {/* Health Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.heartRate.value}</div>
                <p className="text-xs text-muted-foreground">
                  {healthMetrics.heartRate.unit} • {healthMetrics.heartRate.status}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {healthMetrics.heartRate.trend}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.bloodPressure.value}</div>
                <p className="text-xs text-muted-foreground">
                  {healthMetrics.bloodPressure.unit} • {healthMetrics.bloodPressure.status}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {healthMetrics.bloodPressure.trend}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weight</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.weight.value}</div>
                <p className="text-xs text-muted-foreground">
                  {healthMetrics.weight.unit} • {healthMetrics.weight.status}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {healthMetrics.weight.trend}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.steps.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {healthMetrics.steps.unit} • {healthMetrics.steps.status}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {healthMetrics.steps.trend}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${activity.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium text-sm">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={activity.completed ? "default" : "secondary"}>
                        {activity.completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{reminder.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {reminder.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{reminder.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Log Health Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Doctor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Emergency Contacts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
