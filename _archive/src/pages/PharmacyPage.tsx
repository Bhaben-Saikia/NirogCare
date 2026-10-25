/**
 * PharmacyPage - Find Nearby Pharmacies  
 * Shows location permission prompt first, then pharmacy list
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Phone, Navigation, RefreshCw,
  Pill, Search, Loader2, Clock, Star, ExternalLink, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { searchNearbyPharmacies, openDirections, callPharmacy, type Pharmacy } from '@/lib/placesService';

export default function PharmacyPage() {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check if location was already granted
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      const location = JSON.parse(storedLocation);
      const isRecent = Date.now() - location.timestamp < 300000;
      if (isRecent) {
        setLocationGranted(true);
        loadPharmacies();
      }
    }
  }, []);

  const handleLocationRequest = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        localStorage.setItem('userLocation', JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        }));
        setLocationGranted(true);
        setIsGettingLocation(false);
        loadPharmacies();
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError('Unable to get your location. Please enable location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const loadPharmacies = async () => {
    setIsLoading(true);
    try {
      const results = await searchNearbyPharmacies();
      setPharmacies(results);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = !showOpenOnly || pharmacy.isOpen;
    return matchesSearch && matchesOpen;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Pill className="w-6 h-6" />
              <h1 className="text-xl font-bold">Nearby Pharmacies</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          {!locationGranted ? (
            /* ===== LOCATION PERMISSION SCREEN ===== */
            <motion.div
              key="permission"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              {/* Animated Location Icon */}
              <motion.div
                className="relative mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                      <MapPin className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </motion.div>
                </div>

                {/* Pulsing rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4 max-w-sm"
              >
                <h2 className="text-2xl font-bold text-foreground">Enable Location Access</h2>
                <p className="text-muted-foreground">
                  We need your location to find pharmacies and medical stores near you. Your location data is never stored.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Your privacy is protected</span>
                </div>

                {locationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm"
                  >
                    {locationError}
                  </motion.div>
                )}

                <Button
                  onClick={handleLocationRequest}
                  disabled={isGettingLocation}
                  size="lg"
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-lg shadow-primary/20 py-6 text-base"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5 mr-2" />
                      Share My Location
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ===== PHARMACY LIST ===== */
            <motion.div
              key="pharmacies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Search & Filters */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-4 mb-6"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pharmacies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showOpenOnly ? "default" : "outline"}
                      onClick={() => setShowOpenOnly(!showOpenOnly)}
                      className="rounded-xl"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Open Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={loadPharmacies}
                      disabled={isLoading}
                      className="rounded-xl"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">{filteredPharmacies.length}</span>
                    {' '}pharmacies found near you
                  </span>
                </div>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>

              {/* Pharmacy List */}
              <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    Pharmacies Near You
                  </h4>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Finding pharmacies near you...</p>
                  </div>
                ) : filteredPharmacies.length > 0 ? (
                  <div className="grid gap-3">
                    {filteredPharmacies.map((pharmacy, index) => (
                      <motion.div
                        key={pharmacy.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pharmacy.isOpen
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            <MapPin className={`w-5 h-5 ${pharmacy.isOpen ? 'text-emerald-600' : 'text-red-600'
                              }`} />
                          </div>
                          <div>
                            <h5 className="font-semibold">{pharmacy.name}</h5>
                            <p className="text-xs text-muted-foreground">{pharmacy.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-primary">{pharmacy.distance}</span>
                              {pharmacy.rating && (
                                <span className="text-xs flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {pharmacy.rating.toFixed(1)}
                                </span>
                              )}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pharmacy.isOpen
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {pharmacy.openingHours || (pharmacy.isOpen ? 'Open' : 'Closed')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {pharmacy.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-9 px-3"
                              onClick={() => callPharmacy(pharmacy.phone!)}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="rounded-lg h-9 px-3 bg-primary"
                            onClick={() => openDirections(pharmacy)}
                          >
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">No pharmacies found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or refresh</p>
                    <Button variant="outline" className="mt-4" onClick={loadPharmacies}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                )}

                {/* View on Google Maps */}
                {filteredPharmacies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        const firstPharmacy = filteredPharmacies[0];
                        window.open(
                          `https://www.google.com/maps/search/pharmacy+near+me/@${firstPharmacy.location.lat},${firstPharmacy.location.lng},14z`,
                          '_blank'
                        );
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View All on Google Maps
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
