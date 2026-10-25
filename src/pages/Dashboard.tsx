import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Users, Pill, MapPin, Brain, Watch, Trophy, Shield, Phone, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { useHealthCoach } from '@/hooks/useHealthCoach';
import { useWearableDevices } from '@/hooks/useWearableDevices';
import { useGamification } from '@/hooks/useGamification';
import { useFamilyHealth } from '@/hooks/useFamilyHealth';
import { useThemeContext } from '@/components/ui/ThemeProvider';

import ThemeSettings from '@/components/layout/ThemeSettings';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, calculateBMI, calculateAge } = useHealthProfile();
  const { getLatestReadings } = useHealthMetrics();
  const { insights } = useHealthCoach();
  const { connections } = useWearableDevices();
  const { userStats, getUnlockedAchievements } = useGamification();
  const { familyMembers, getFamilyHealthSummary } = useFamilyHealth();
  const { isDarkMode } = useThemeContext();

  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const latestReadings = getLatestReadings();
  const unlockedAchievements = getUnlockedAchievements();
  const familySummary = getFamilyHealthSummary();
  const connectedDevices = connections.filter(c => c.isConnected);

  const bmi = profile ? calculateBMI() : null;
  const age = profile ? calculateAge() : null;

  // Quick action cards
  const quickActions = [
    {
      title: 'Find Pharmacy',
      description: 'Locate nearby medical stores',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-500',
      onClick: () => navigate('/nearby-stores')
    },
    {
      title: 'Health Monitor',
      description: 'Track vital signs',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-red-500',
      onClick: () => navigate('/health-tools')
    },
    {
      title: 'AI Symptom Check',
      description: 'Analyze symptoms',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-500',
      onClick: () => navigate('/symptom-checker')
    },
    {
      title: 'Emergency',
      description: 'Emergency contacts',
      icon: <Phone className="w-6 h-6" />,
      color: 'bg-orange-500',
      onClick: () => navigate('/emergency-contacts')
    },
    {
      title: 'Family Health',
      description: 'Manage family',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      onClick: () => navigate('/family-health')
    },
    {
      title: 'Achievements',
      description: 'View progress',
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-yellow-500',
      onClick: () => navigate('/achievements')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}, {profile?.personalInfo?.firstName || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSettings />
              <div className="text-right">
                <div className="text-sm font-medium">Level {userStats.currentLevel}</div>
                <div className="text-xs text-muted-foreground">{userStats.totalPoints} points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <Badge variant="outline">Health</Badge>
                </div>
                <div className="text-2xl font-bold">
                  {bmi ? bmi.value.toFixed(1) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">BMI</p>
                {bmi && (
                  <Progress
                    value={Math.min((bmi.value / 30) * 100, 100)}
                    className="mt-2 h-2"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <Badge variant="outline">Activity</Badge>
                </div>
                <div className="text-2xl font-bold">
                  {latestReadings.heartRate ?
                    (typeof latestReadings.heartRate.value === 'number' ?
                      latestReadings.heartRate.value :
                      `${latestReadings.heartRate.value.systolic}/${latestReadings.heartRate.value.diastolic}`
                    ) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">Heart Rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <Badge variant="outline">Family</Badge>
                </div>
                <div className="text-2xl font-bold">
                  {familyMembers.length}
                </div>
                <p className="text-sm text-muted-foreground">Family Members</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Watch className="w-5 h-5 text-purple-500" />
                  <Badge variant="outline">Devices</Badge>
                </div>
                <div className="text-2xl font-bold">
                  {connectedDevices.length}
                </div>
                <p className="text-sm text-muted-foreground">Connected</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          className="h-20 flex-col gap-2 w-full"
                          onClick={action.onClick}
                        >
                          <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-white`}>
                            {action.icon}
                          </div>
                          <span className="text-xs font-medium text-center">{action.title}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Insights */}
            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Health Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className={`p-3 rounded-lg border ${insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                              insight.type === 'recommendation' ? 'bg-blue-50 border-blue-200' :
                                'bg-green-50 border-green-200'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-2 bg-primary"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{insight.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                              {insight.actionRequired && (
                                <Button size="sm" variant="outline" className="mt-2">
                                  {insight.actionText || 'Take Action'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recent Achievements */}
            {unlockedAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                          className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                          <Badge variant="outline">+{achievement.points}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Status & Activity */}
          <div className="space-y-6">
            {/* User Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Health Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Health Score</p>
                      <p className="text-2xl font-bold text-green-600">85/100</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Age</span>
                      <span>{age ? `${age} years` : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Blood Type</span>
                      <span>{profile?.personalInfo?.bloodType || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Activity Level</span>
                      <span>{profile?.personalInfo?.activityLevel || 'Not set'}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => navigate('/medical-id')}>
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Today's Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Steps</span>
                      <span>7,234 / 10,000</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Water Intake</span>
                      <span>5 / 8 glasses</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Exercise</span>
                      <span>25 / 30 min</span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Quick Access */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Emergency Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => navigate('/emergency-contacts')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Contacts
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-100"
                    onClick={() => navigate('/medical-id')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Medical ID
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>


    </div>
  );
}
