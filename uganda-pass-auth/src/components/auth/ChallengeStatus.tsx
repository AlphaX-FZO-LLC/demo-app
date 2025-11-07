import { Clock, Hourglass } from 'lucide-react';

interface ChallengeStatusProps {
  timeLeft: number;
}

export default function ChallengeStatus({ timeLeft }: ChallengeStatusProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
      <div className='flex gap-2 items-center text-[#D65D2F]'>
        <Hourglass className='w-5 h-5 flex-shrink-0' /> 
        <span className="font-medium">Waiting for your confirmation</span>
      </div>
      <div className='flex gap-2 items-center text-gray-700'>
        <Clock className='w-5 h-5 flex-shrink-0' /> 
        <span className="font-medium">
          Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}