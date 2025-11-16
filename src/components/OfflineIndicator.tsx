import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OfflineIndicator = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="ml-2">
          You're offline. Browsing cached content.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const OnlineStatusBadge = () => {
  const { isOnline } = useOffline();

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
};
