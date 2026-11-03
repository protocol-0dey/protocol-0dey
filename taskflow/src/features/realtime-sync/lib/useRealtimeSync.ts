import { useEffect } from 'react';
import { useBoardStore } from '@/entities/board';
import { realtime } from '@/shared/lib';
import { toast } from '@/shared/ui';

/** Keeps the board in sync with changes made in other tabs (BroadcastChannel stands in for a WebSocket). */
export function useRealtimeSync(): void {
  const load = useBoardStore((state) => state.load);

  useEffect(() => {
    return realtime.subscribe(() => {
      void load({ silent: true });
      toast.info('Board updated in another tab');
    });
  }, [load]);
}
