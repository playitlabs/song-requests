import { useQuery } from "@tanstack/react-query";
import { SettingsDto } from "../../../shared/SettingsDto";

export function useSettingsQuery() {
    return useQuery<SettingsDto, Error>({
        queryKey: ['settings'],
        queryFn: () => fetch('/api/settings').then(res => res.json()),
        staleTime: Infinity
    })
}