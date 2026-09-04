import { OneMotoringCamera } from '../types';

export const ONEMOTORING_URL =
  'https://onemotoring.lta.gov.sg/content/onemotoring/home/driving/traffic_information/traffic-cameras.html';

export const LTA_API_ENDPOINT = 'https://api.data.gov.sg/v1/transport/traffic-images';

interface CameraMetaDefinition {
  id: string;
  checkpoint: 'woodlands' | 'tuas';
  name: string;
  direction: string;
  locationDescription: string;
  latitude: number;
  longitude: number;
  fallbackImage: string;
}

export const CHECKPOINT_CAMERA_DEFINITIONS: CameraMetaDefinition[] = [
  {
    id: '2701',
    checkpoint: 'woodlands',
    name: 'View from Woodlands Causeway (Towards Johor)',
    direction: 'SG ➔ JB (Causeway Towards Johor)',
    locationDescription: 'Woodlands Causeway approach towards Sultan Iskandar CIQ (BSI)',
    latitude: 1.447023728,
    longitude: 103.7716543,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/39964e55-7f10-40ce-a26f-23d6b99ff7d4.jpg',
  },
  {
    id: '2702',
    checkpoint: 'woodlands',
    name: 'View from Woodlands Checkpoint (Towards BKE)',
    direction: 'JB ➔ SG (Towards BKE Expressway)',
    locationDescription: 'Woodlands Checkpoint concourse viaduct heading towards Bukit Timah Expressway',
    latitude: 1.445554109,
    longitude: 103.7683397,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/92776318-04e6-45ab-8135-12bd35028137.jpg',
  },
  {
    id: '2704',
    checkpoint: 'woodlands',
    name: 'View from Woodlands Flyover (Towards Checkpoint)',
    direction: 'SG ➔ Checkpoint (Flyover Approach)',
    locationDescription: 'BKE Woodlands Flyover feeder lanes heading into Checkpoint immigration',
    latitude: 1.429588536,
    longitude: 103.769311,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/791832f0-f9e9-412b-93df-f72e15bef7a7.jpg',
  },
  {
    id: '4703',
    checkpoint: 'tuas',
    name: 'View from Second Link at Tuas',
    direction: 'SG ➔ MY (Second Link Bridge)',
    locationDescription: 'Malaysia-Singapore Second Link Bridge heading towards Tanjung Kupang (KSAB)',
    latitude: 1.348697862,
    longitude: 103.6350413,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/e9ae8395-e152-4692-b053-412cda2a10e4.jpg',
  },
  {
    id: '4712',
    checkpoint: 'tuas',
    name: 'View from After Tuas West Road',
    direction: 'SG ➔ Tuas Checkpoint (AYE Approach)',
    locationDescription: 'Ayer Rajah Expressway (AYE) after Tuas West Road approach to customs',
    latitude: 1.341244001,
    longitude: 103.6439134,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/53626f82-0448-4d45-9161-b7b9d092802b.jpg',
  },
  {
    id: '4713',
    checkpoint: 'tuas',
    name: 'View from Tuas Checkpoint',
    direction: 'Tuas CIQ Toll & Clearance Plaza',
    locationDescription: 'Tuas Checkpoint immigration complex concourse and vehicle clearance lanes',
    latitude: 1.347645829,
    longitude: 103.6366955,
    fallbackImage: 'https://images.data.gov.sg/api/traffic-images/2026/09/c7f600d7-8486-47ec-a8db-ebdb6c2a3efb.jpg',
  },
];

const LOCAL_STORAGE_CACHE_KEY = 'sweelah_onemotoring_cams_v1';

function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Just now';
  }
}

/**
 * Returns default camera objects based on official LTA OneMotoring definitions
 */
export function getDefaultOneMotoringCameras(): OneMotoringCamera[] {
  const now = new Date().toISOString();
  return CHECKPOINT_CAMERA_DEFINITIONS.map((def) => ({
    id: def.id,
    checkpoint: def.checkpoint,
    name: def.name,
    direction: def.direction,
    locationDescription: def.locationDescription,
    imageUrl: def.fallbackImage,
    timestamp: now,
    formattedTime: formatTimestamp(now),
    latitude: def.latitude,
    longitude: def.longitude,
    sourceUrl: ONEMOTORING_URL,
    isOnline: true,
  }));
}

export interface FetchCamsResult {
  cameras: OneMotoringCamera[];
  fetchedAt: string;
  source: 'live' | 'cached' | 'fallback';
  error?: string;
}

/**
 * Fetches live camera feeds from Singapore LTA DataMall / data.gov.sg open API,
 * which provides the real-time feeds shown on OneMotoring.
 */
export async function fetchLiveOneMotoringCameras(): Promise<FetchCamsResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(LTA_API_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OneMotoring API returned status ${response.status}`);
    }

    const data = await response.json();
    const items = data?.items;
    if (!items || !items.length || !items[0].cameras) {
      throw new Error('No camera items returned from traffic camera API');
    }

    const apiCameras: Array<{
      camera_id: string;
      image: string;
      timestamp: string;
      location?: { latitude: number; longitude: number };
    }> = items[0].cameras;

    const cameraMap = new Map<string, { image: string; timestamp: string; location?: { latitude: number; longitude: number } }>();
    for (const c of apiCameras) {
      if (c.camera_id && c.image) {
        cameraMap.set(String(c.camera_id), {
          image: c.image,
          timestamp: c.timestamp,
          location: c.location,
        });
      }
    }

    const mappedCameras: OneMotoringCamera[] = CHECKPOINT_CAMERA_DEFINITIONS.map((def) => {
      const liveData = cameraMap.get(def.id);
      const imageUrl = liveData?.image || def.fallbackImage;
      const timestamp = liveData?.timestamp || new Date().toISOString();

      return {
        id: def.id,
        checkpoint: def.checkpoint,
        name: def.name,
        direction: def.direction,
        locationDescription: def.locationDescription,
        imageUrl,
        timestamp,
        formattedTime: formatTimestamp(timestamp),
        latitude: liveData?.location?.latitude ?? def.latitude,
        longitude: liveData?.location?.longitude ?? def.longitude,
        sourceUrl: ONEMOTORING_URL,
        isOnline: true,
      };
    });

    // Cache successful fetch in localStorage
    try {
      localStorage.setItem(
        LOCAL_STORAGE_CACHE_KEY,
        JSON.stringify({
          cameras: mappedCameras,
          cachedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage quota errors
    }

    return {
      cameras: mappedCameras,
      fetchedAt: formatTimestamp(new Date().toISOString()),
      source: 'live',
    };
  } catch (err: any) {
    console.warn('Live OneMotoring fetch warning, attempting cached or fallback data:', err);

    // Try localStorage cache
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cameras && Array.isArray(parsed.cameras) && parsed.cameras.length) {
          return {
            cameras: parsed.cameras,
            fetchedAt: formatTimestamp(parsed.cachedAt || new Date().toISOString()),
            source: 'cached',
            error: err?.message || 'Using cached OneMotoring camera snapshots',
          };
        }
      }
    } catch {
      // fallback to defaults below
    }

    // Default fallbacks
    const defaults = getDefaultOneMotoringCameras();
    return {
      cameras: defaults,
      fetchedAt: formatTimestamp(new Date().toISOString()),
      source: 'fallback',
      error: err?.message || 'Live network unreachable, showing fallback checkpoint feeds',
    };
  }
}
