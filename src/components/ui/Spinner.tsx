interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  black?: boolean;
}

export default function Spinner({ size = 'sm', className = '', black = false }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          animate-spin rounded-full border-2 border-gray-300
          ${black ? 'border-t-black' : 'border-t-blue-500'}
        `}
        role="status"
      />
    </div>
  );
}
