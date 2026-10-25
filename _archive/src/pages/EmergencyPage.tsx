import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, MapPin, AlertTriangle, Shield, Users, Plus, Edit, Trash2 } from 'lucide-react';

export default function EmergencyPage() {
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', type: 'Doctor', phone: '+1 234-567-8900', relation: 'Primary Care Physician' },
    { id: 2, name: 'John Doe', type: 'Family', phone: '+1 234-567-8901', relation: 'Spouse' },
    { id: 3, name: 'Local Hospital', type: 'Hospital', phone: '911', relation: 'Emergency' }
  ]);

  const medicalInfo = {
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    emergencyContact: 'John Doe (Spouse) - +1 234-567-8901'
  };

  const handleEmergencyCall = (number: string) => {
    alert(`🚨 EMERGENCY: Would call ${number} immediately!`);
  };

  const handleSOS = () => {
    alert('🚨 SOS ACTIVATED: Would send emergency alerts to all contacts and emergency services!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-red-50 dark:bg-red-950/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold">Emergency Contacts</h1>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              Emergency Ready
            </Badge>
          </div>
        </div>
      </header>

      {/* SOS Button */}
      <section className="py-8 bg-red-50 dark:bg-red-950/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="w-full h-20 text-lg bg-red-600 hover:bg-red-700 animate-pulse"
                  onClick={handleSOS}
                >
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  EMERGENCY SOS
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Press and hold for 3 seconds to activate emergency alerts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Medical ID */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Medical ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Medical Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <Badge variant="outline">{medicalInfo.bloodType}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Allergies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medicalInfo.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Medications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medicalInfo.medications.map((med, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medicalInfo.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Primary Emergency Contact</h4>
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{medicalInfo.emergencyContact}</p>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleEmergencyCall(medicalInfo.emergencyContact.split(' - ')[1])}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Emergency Contacts
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.id} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{contact.name}</h4>
                            <Badge variant={contact.type === 'Hospital' ? 'destructive' : 'secondary'}>
                              {contact.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{contact.relation}</p>
                          <p className="font-medium">{contact.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEmergencyCall(contact.phone)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className="h-16 justify-start"
                  onClick={() => handleEmergencyCall('911')}
                >
                  <Phone className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Emergency Services</div>
                    <div className="text-sm text-muted-foreground">911</div>
                  </div>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-16 justify-start"
                  onClick={() => handleEmergencyCall('1-800-222-1222')}
                >
                  <Phone className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Poison Control</div>
                    <div className="text-sm text-muted-foreground">1-800-222-1222</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
