import { Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? 32 : 24;

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <Shield
          size={iconSize}
          className="text-white group-hover:text-accent transition-colors duration-300"
        />
        <Globe
          size={iconSize * 0.5}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
        />
      </div>
      <span className={`font-semibold text-white ${size === "large" ? "text-xl" : "text-lg"}`}>
        GeoSentra
      </span>
    </Link>
  );
};

export default Logo;
