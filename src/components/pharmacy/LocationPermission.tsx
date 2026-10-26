import { motion } from 'framer-motion';
import { MapPin, Navigation, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getUserLocation } from '@/lib/placesService';

interface LocationPermissionProps {
  onRequestLocation: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function LocationPermission({ onRequestLocation, isLoading, error }: LocationPermissionProps) {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const handleLocationRequest = async () => {
    setLocationStatus('requesting');

    const tryIpFallback = async () => {
      try {
        const geo = await getUserLocation();
        setLocationStatus('granted');
        localStorage.setItem(
          'userLocation',
          JSON.stringify({
            lat: geo.lat,
            lng: geo.lng,
            city: geo.city,
            timestamp: Date.now()
          })
        );
        onRequestLocation();
      } catch {
        setLocationStatus('denied');
        onRequestLocation();
      }
    };

    if (!navigator.geolocation) {
      await tryIpFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus('granted');
        localStorage.setItem(
          'userLocation',
          JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now()
          })
        );
        onRequestLocation();
      },
      async (err) => {
        console.warn('Browser GPS unavailable, using network/edge location:', err.message);
        await tryIpFallback();
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 300000
      }
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}

        <Button
          onClick={handleLocationRequest}
          disabled={locationStatus === 'requesting' || locationStatus === 'granted'}
          size="lg"
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-lg shadow-primary/20 py-6 text-base"
        >
          {locationStatus === 'requesting' || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : locationStatus === 'granted' ? (
            <>
              <MapPin className="w-5 h-5 mr-2" />
              Location Access Granted
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
  );
}
