import { Link } from "@tanstack/react-router";
import { getPhotoUrl, getPlaceholderGradient } from "@/lib/storage";

export interface PhotoTileData {
  id: string;
  title_ar: string;
  year: number | null;
  aspect: "portrait" | "landscape" | "square" | null;
  storage_path: string | null;
  governorates?: { name_ar: string } | null;
}

export function PhotoTile({ photo, className = "" }: { photo: any; className?: string }) {
  const title = photo.title_ar;
  const year = photo.year;
  const aspect = photo.aspect ?? "portrait";
  
  const govName = photo.governorates?.name_ar ?? "صنعاء";
  
  // Get image source: either public URL from storage or a fallback mock gradient
  const imageUrl = photo.storage_path ? getPhotoUrl(photo.storage_path) : null;
  const backgroundStyle = imageUrl 
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: getPlaceholderGradient(photo.id) };

  const aspectClass = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    square: "aspect-square",
  }[aspect as "portrait" | "landscape" | "square"] ?? "aspect-[3/4]";

  return (
    <Link
      to="/archive/$photoId"
      params={{ photoId: photo.id }}
      className={`group block ${className}`}
    >
      <div
        className={`w-full ${aspectClass} outline outline-1 -outline-offset-1 outline-black/5 rounded-sm overflow-hidden relative bg-foreground/5`}
      >
        <div
          className="absolute inset-0 group-hover:scale-[1.03] transition-transform duration-[900ms]"
          style={backgroundStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-3 right-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-80">
            {govName} · {year}
          </p>
          <p className="text-sm font-semibold mt-1 line-clamp-2">{title}</p>
        </div>
        <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-widest text-white/80 bg-black/25 backdrop-blur-sm px-1.5 py-0.5 rounded">
          FL-{photo.id.slice(0, 5).toUpperCase()}
        </span>
      </div>
      <div className="mt-3">
        <span className="text-[10px] font-mono text-accent uppercase tracking-widest">
          {govName} · {year}
        </span>
        <h3 className="text-sm font-semibold mt-1 text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
    </Link>
  );
}