import { mutate } from 'swr'

const LAST_SEEN_URL = 'https://hashi-explorer.xyz/api_bridge_ui/lastseen'
const REFRESH_INTERVAL = 2 * 60 * 1000 // 2 minutes in milliseconds

export function setupLastSeenFetcher() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())

  // Set up the SWR configuration
  mutate(LAST_SEEN_URL, fetcher(LAST_SEEN_URL), {
    refreshInterval: REFRESH_INTERVAL,
    refreshWhenHidden: true,
    refreshWhenOffline: false,
  })

  // Return the mutate function for manual updates if needed
  return () => mutate(LAST_SEEN_URL)
}

// Function to get the latest data
export function getLastSeen() {
  return mutate(LAST_SEEN_URL)
}
