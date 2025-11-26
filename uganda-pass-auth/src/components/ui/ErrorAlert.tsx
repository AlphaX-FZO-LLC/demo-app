interface Props {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="bg-red-50 border mt-1 border-red-200 rounded-md p-1.5 mb-4">
      <div className="flex justify-between items-start">
        <p className="text-sm text-red-600">{message}</p>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}