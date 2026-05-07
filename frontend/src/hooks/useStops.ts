import { useQuery } from "@tanstack/react-query";
import { mapApi } from "@/services/api";


export function useStops() {
  return useQuery({
    queryKey: ['yatra-stops'],
    queryFn: mapApi.getStops,
    staleTime: Infinity, 
    retry: 2
  });
}