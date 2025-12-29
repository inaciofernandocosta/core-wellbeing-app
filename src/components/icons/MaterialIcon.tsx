interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

const MaterialIcon = ({ name, className = "", filled = false }: MaterialIconProps) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ 
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
