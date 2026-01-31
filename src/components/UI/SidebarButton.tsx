interface SidebarButtonProps {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    color?: "blue" | "yellow" | "green" | "purple";
  }
  
  const colorMap = {
    blue: {
      bg: "bg-blue-50 hover:bg-blue-100",
      icon: "text-blue-600",
      active: "bg-blue-100 ring-2 ring-blue-200",
    },
    yellow: {
      bg: "bg-yellow-50 hover:bg-yellow-100",
      icon: "text-yellow-600",
      active: "bg-yellow-100 ring-2 ring-yellow-200",
    },
    green: {
      bg: "bg-green-50 hover:bg-green-100",
      icon: "text-green-600",
      active: "bg-green-100 ring-2 ring-green-200",
    },
    purple: {
      bg: "bg-purple-50 hover:bg-purple-100",
      icon: "text-purple-600",
      active: "bg-purple-100 ring-2 ring-purple-200",
    },
  };
  
  function SidebarButton({
    label,
    icon,
    onClick,
    active,
    color = "blue",
  }: SidebarButtonProps) {
    const c = colorMap[color];
  
    return (
      <button
        onClick={onClick}
        className={`
          w-14 h-14 sm:w-16 sm:h-16
          px-8 sm:px-10
          flex flex-col items-center justify-center gap-1
          rounded-xl
          transition-all
          duration-200
          ${active ? c.active : c.bg}
          hover:shadow
          active:scale-95
        `}
      >
        <div className={`text-lg sm:text-xl ${c.icon}`}>{icon}</div>
        <span className="text-[10px] sm:text-[11px] font-medium text-gray-700">
          {label}
        </span>
      </button>
    );
  }

  export default SidebarButton;