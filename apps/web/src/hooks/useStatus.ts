import { useQuery } from '@tanstack/react-query';
import { statusService } from '../services/statusService';

/** Polls server status every 30s, matching the legacy home-screen refresh cadence. */
export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: () => statusService.getStatus(),
    refetchInterval: 30_000,
  });
}
