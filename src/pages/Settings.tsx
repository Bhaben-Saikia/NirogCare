import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, Globe, Smartphone, HelpCircle, LogOut, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '@/components/ui/ThemeProvider';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useGamification } from '@/hooks/useGamification';
import { useFamilyHealth } from '@/hooks/useFamilyHealth';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateTheme, updateFontSize, toggleHighContrast, toggleReducedMotion, toggleScreenReader } = useThemeContext();
  const { profile } = useHealthProfile();
  const { exportFamilyHealthData } = useFamilyHealth();
  const { userStats } = useGamification();

  const [notifications, setNotifications] = useState({
    medication: true,
    appointments: true,
    healthTips: true,
    achievements: true,
    familyUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    shareData: false,
    analytics: true,
    location: true,
    crashReports: true
  });

  const handleExportData = () => {
    const data = {
      profile: profile,
      gamification: userStats,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nirogcare-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDeleteData = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // In a real app, this would clear auth tokens
      localStorage.removeItem('nirogcare_onboarding_completed');
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => updateTheme('light')}
                  className="flex flex-col gap-2 h-20"
                >
                  <div className="w-8 h-8 bg-white border-2 rounded"></div>
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => updateTheme('dark')}
                  className="flex flex-col gap-2 h-20"
                >
                  <div className="w-8 h-8 bg-gray-900 border-2 rounded"></div>
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={settings.theme === 'auto' ? 'default' : 'outline'}
                  onClick={() => updateTheme('auto')}
                  className="flex flex-col gap-2 h-20"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-900 border-2 rounded"></div>
                  <span className="text-xs">Auto</span>
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={updateFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Contrast</Label>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch checked={settings.highContrast} onCheckedChange={toggleHighContrast} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch checked={settings.reducedMotion} onCheckedChange={toggleReducedMotion} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Screen Reader Mode</Label>
                    <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                  </div>
                  <Switch checked={settings.screenReader} onCheckedChange={toggleScreenReader} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{profile?.personalInfo?.firstName} {profile?.personalInfo?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">Level {userStats.currentLevel} • {userStats.totalPoints} points</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/onboarding')}>
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/onboarding')}>
                  <User className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Anonymous Data</Label>
                  <p className="text-sm text-muted-foreground">Help improve NirogCare with anonymous usage data</p>
                </div>
                <Switch checked={privacy.shareData} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareData: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Allow us to analyze app usage patterns</p>
                </div>
                <Switch checked={privacy.analytics} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Location Services</Label>
                  <p className="text-sm text-muted-foreground">Allow app to access your location for pharmacy finder</p>
                </div>
                <Switch checked={privacy.location} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, location: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Crash Reports</Label>
                  <p className="text-sm text-muted-foreground">Automatically send crash reports to help fix issues</p>
                </div>
                <Switch checked={privacy.crashReports} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, crashReports: checked }))} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/emergency-contacts')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Emergency Contacts
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/medical-id')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Configure Medical ID
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Medication Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to take your medications</p>
                </div>
                <Switch checked={notifications.medication} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, medication: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Notifications for upcoming appointments</p>
                </div>
                <Switch checked={notifications.appointments} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointments: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Health Tips</Label>
                  <p className="text-sm text-muted-foreground">Daily health and wellness tips</p>
                </div>
                <Switch checked={notifications.healthTips} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, healthTips: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">Celebrate your health achievements</p>
                </div>
                <Switch checked={notifications.achievements} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, achievements: checked }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Family Updates</Label>
                  <p className="text-sm text-muted-foreground">Updates about family member health</p>
                </div>
                <Switch checked={notifications.familyUpdates} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, familyUpdates: checked }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportFamilyHealthData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Family Data
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Health Profile
                </Button>
              </div>

              <Separator />

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your data, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" className="w-full" onClick={handleDeleteData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                About NirogCare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">NirogCare</h3>
                <p className="text-muted-foreground mb-4">Version 2.0.0</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your comprehensive healthcare platform for managing personal and family health, 
                  with AI-powered insights, wearable integration, and emergency preparedness.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">10+</div>
                  <p className="text-sm text-muted-foreground">Features</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                  <p className="text-sm text-muted-foreground">Privacy</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
