type InfoItemProps = {
  label: string;
  value: string | number;
  full?: boolean;
  variant?: "default" | "danger" | "success" | "warning" | "info";
};

const InfoItem = ({ label, value, full, variant = "default" }: InfoItemProps) => {
  const variantClasses = {
    default: "bg-transparent text-gray-900",
    danger: "bg-red-100 text-red-800 border border-red-200 rounded-md px-2 py-1",
    success: "bg-green-100 text-green-800 border border-green-200 rounded-md px-2 py-1",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md px-2 py-1",
    info: "bg-blue-100 text-blue-800 border border-blue-200 rounded-md px-2 py-1",
  };

  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs text-gray-500 font-semibold">{label}</div>
      <div className={`font-medium ${variantClasses[variant]}`}>{value}</div>
    </div>
  );
};


type SectionProps = {
  title: string;
  badge?: string;
  color?: "blue" | "purple";
  children: React.ReactNode;
};

const Section = ({ title, badge, color = "blue", children }: SectionProps) => {
  const colors =
    color === "blue"
      ? "text-blue-600 bg-blue-50"
      : "text-purple-600 bg-purple-50";
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-semibold ${colors.split(" ")[0]}`}>
          {title}
        </h4>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${colors}`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

export { InfoItem, Section };