interface ChallengeDisplayProps {
  challengeNumber: number;
}

export default function ChallengeDisplay({ challengeNumber }: ChallengeDisplayProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#D65D2F] mb-2">
        {challengeNumber}
      </h2>
      <p className="text-center text-gray-600 text-sm">
        Challenge Number
      </p>
    </div>
  );
}