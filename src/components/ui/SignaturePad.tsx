import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from './Button';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onEnd: (signature: string) => void;
  onClear: () => void;
  className?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onEnd, onClear, className }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    sigCanvas.current?.clear();
    onClear();
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      onEnd(dataUrl);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <SignatureCanvas
        ref={sigCanvas}
        penColor='black'
        canvasProps={{ className: 'w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg' }}
        onEnd={handleEnd}
      />
      <Button onClick={handleClear} variant="ghost" size="sm" className="absolute top-2 right-2" icon={Eraser}>Limpiar</Button>
    </div>
  );
};

export default SignaturePad;
