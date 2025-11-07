import Image from 'next/image';
import { Button } from '../ui/button';
import { CardHeader, CardTitle, CardDescription } from '../ui/card';

interface AuthHeaderProps {
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export default function AuthHeader({ showCancelButton = false, onCancel }: AuthHeaderProps) {
  return (
    <CardHeader className="border-b flex justify-between items-center">
      <div className='flex gap-2 items-center'>
        <Image
          src="/app-icon.svg"
          alt="App Icon"
          width={42}
          height={42}
        />
        <div>
          <CardTitle>X Pass</CardTitle>
          <CardDescription>Secure Auth System</CardDescription>
        </div>
      </div>
      {showCancelButton && onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-red-600 w-[160px] !cursor-pointer !h-10 hover:text-red-700 border-red-700 border font-semibold rounded-full"
        >
          Cancel 
        </Button>
      )}
    </CardHeader>
  );
}