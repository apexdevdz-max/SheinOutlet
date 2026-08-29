/** Single source of truth for the physical store location. */
export const STORE_LOCATION = {
  lat: 35.6831038,
  lng: -0.6511393,
  name: "Shein outlet",
  /** Direct link to the Google Maps place page */
  mapsUrl: "https://www.google.com/maps/place/Shein+outlet/@35.6830707,-0.6513294,19.68z/data=!4m6!3m5!1s0xd7e89001a825c7b:0x106946a9f3954ba4!8m2!3d35.6831038!4d-0.6511393!16s%2Fg%2F11xfkbghvr",
} as const;

/** URL for the "Open in Google Maps" button */
export const STORE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`;

/** URL for the embedded iframe map */
export const STORE_EMBED_URL = `https://maps.google.com/maps?q=${STORE_LOCATION.lat},${STORE_LOCATION.lng}&z=17&output=embed`;
