import { useState, useRef } from "react";
import { createPortal } from "react-dom";

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setVisible(true);
  };

  const handleLeave = () => setVisible(false);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative inline-flex"
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            className="absolute px-2 py-1 mt-12 rounded-md bg-gray-800 text-white text-xs shadow-lg z-[9999] transform -translate-x-1/2 -translate-y-2 pointer-events-none"
            style={{ top: coords.y, left: coords.x, position: "fixed" }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}

export default Tooltip;