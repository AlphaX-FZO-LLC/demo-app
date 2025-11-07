import Image from 'next/image';

interface PhoneImageDisplayProps {
  imageSrc: string;
  altText: string;
  width?: number;
  height?: number;
  maxWidth?: string;
  customHeight?: string;
}

export default function PhoneImageDisplay({ 
  imageSrc, 
  altText, 
  width = 643, 
  height = 620,
  maxWidth = "md:max-w-2xl",
  customHeight = "h-auto"
}: PhoneImageDisplayProps) {
  return (
    <div className="w-full flex justify-center lg:justify-end">
      <div className={`relative w-full max-w-sm ${maxWidth} ${customHeight}`}>
        <Image
          src={imageSrc}
          alt={altText}
          width={width}
          height={height}
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}