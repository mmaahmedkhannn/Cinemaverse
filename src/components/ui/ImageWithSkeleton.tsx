import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const ImageWithSkeleton = ({ containerClassName = '', className = '', ...props }: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/10 animate-pulse"
          />
        )}
      </AnimatePresence>
      <img
        {...props}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        onLoad={(e) => {
          setIsLoaded(true);
          if (props.onLoad) props.onLoad(e);
        }}
        alt={props.alt || 'Image'}
      />
    </div>
  );
};

export default ImageWithSkeleton;
