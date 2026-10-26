/**
 * NearbyStores - Find Nearby Pharmacies
 * Shows location permission prompt first, then pharmacy list
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Phone, Navigation, RefreshCw,
  Pill, Search, Sparkles, Loader2, Clock, Star, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { searchNearbyPharmacies, openDirections, callPharmacy, getUserLocation, type Pharmacy } from '@/lib/placesService';
import Header from '@/components/layout/Header';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import LocationPermission from '@/components/pharmacy/LocationPermission';

export default function NearbyStores() {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  const syncCityFromStorage = () => {
    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.city) {
          setDetectedCity(parsed.city);
        }
      }
    } catch {
      // Ignore
    }
  };

  // Check if location was already granted
  useEffect(() => {
    syncCityFromStorage();
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        const isRecent = Date.now() - (location.timestamp || 0) < 600000; // 10 minutes
        if (isRecent) {
          setLocationGranted(true);
          loadPharmacies();
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleLocationRequest = () => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        if (Date.now() - (location.timestamp || 0) < 600000) {
          if (location.city) setDetectedCity(location.city);
          setLocationGranted(true);
          loadPharmacies();
          return;
        }
      } catch {
        // Ignore
      }
    }
    setLocationGranted(true);
    loadPharmacies();
  };

  const loadPharmacies = async () => {
    setIsLoading(true);
    try {
      const results = await searchNearbyPharmacies();
      setPharmacies(results);
      syncCityFromStorage();
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter pharmacies
  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = !showOpenOnly || pharmacy.isOpen;
    return matchesSearch && matchesOpen;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden gradient-hero rounded-3xl p-6 md:p-8 text-white mb-6"
        >
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative flex items-start gap-4">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Pill className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                Nearby Pharmacies
                <Sparkles className="w-6 h-6 text-amber-300" />
              </h1>
              <p className="text-white/80">
                {detectedCity ? `Find medical stores near ${detectedCity}` : 'Find medical stores around you'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!locationGranted ? (
            /* ===== LOCATION PERMISSION SCREEN ===== */
            <LocationPermission
              key="permission"
              onRequestLocation={handleLocationRequest}
              isLoading={isGettingLocation}
              error={locationError}
            />
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
                transition={{ delay: 0.1 }}
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
                    {' '}pharmacies found
                    {detectedCity && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Near {detectedCity}
                      </span>
                    )}
                  </span>
                </div>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>

              {/* Pharmacy List */}
              <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    Nearby Pharmacies
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

                {/* View on Google Maps Link */}
                {filteredPharmacies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        window.open(
                          'https://www.google.com/maps/search/?api=1&query=pharmacies+near+me',
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

      <FloatingChatButton />
    </div>
  );
}
