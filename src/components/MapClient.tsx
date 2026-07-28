import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Governorate, MapMarker } from "@/lib/types";

// Fix leaflet default icon issue in React
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

const createCustomIcon = (active: boolean, count: number) => {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `
      <div class="relative group cursor-pointer w-8 h-8 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full ${active ? "bg-accent/40 animate-ping" : "bg-accent/20"}"></div>
        <div class="relative w-4 h-4 bg-accent rounded-full border-2 border-white shadow-sm z-10"></div>
        ${count > 0 ? `<div class="absolute -top-2 -right-2 bg-foreground text-background text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shadow-md z-20">${count}</div>` : ""}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function MapClient({ 
  mapPhotos, 
  selectedPhotoId, 
  setSelectedPhotoId 
}: { 
  mapPhotos: any[]; 
  selectedPhotoId: string | null; 
  setSelectedPhotoId: (id: string) => void;
}) {
  const selectedPhoto = mapPhotos.find((p) => p.id === selectedPhotoId) ?? null;

  return (
    <MapContainer
      center={[15.5527, 48.5164]}
      zoom={6}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {selectedPhoto && <MapUpdater center={[selectedPhoto.lat, selectedPhoto.lng]} zoom={12} />}

      {mapPhotos.map((p) => {
        const active = selectedPhotoId === p.id;
        // Use the category color if available, else default to accent color
        const color = p.heritage_categories?.color || "#a86b3d";
        
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={L.divIcon({
              className: "bg-transparent border-none",
              html: `
                <div class="relative group cursor-pointer w-8 h-8 flex items-center justify-center">
                  <div class="absolute inset-0 rounded-full ${active ? "animate-ping opacity-60" : "opacity-20"}" style="background-color: ${color}"></div>
                  <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-sm z-10" style="background-color: ${color}"></div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
            eventHandlers={{ click: () => setSelectedPhotoId(p.id) }}
          >
            <Popup className="font-sans" closeButton={false}>
              <div className="text-right" dir="rtl">
                <strong className="block text-sm font-bold mb-1">{p.title_ar}</strong>
                {p.governorates && <span className="text-xs text-muted-foreground">{p.governorates.name_ar}</span>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
