import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { Container } from '../container';

interface Props {
  className?: string;
  count?: number;
}

export const SkeletonFollbackTopBar: React.FC<Props> = ({ className, count = 1 }): JSX.Element => {
  return ( 
    <Container className="flex items-center justify-between ">
            <Skeleton
              className={cn(    
                'w-full h-15 rounded-sm  bg-gray-200 flex items-center gap-2 px-2',
                className,
              )}
            >
              {/*  */}                
              <div className="flex items-center justify-between w-full">
                {/*  */}
                <div className="flex  gap-2 bg-gray-300 rounded-xl">
                  {Array.from({ length: count }).map((_, index) => (
                    <Skeleton key={index} className="w-20 h-10 rounded-xl  bg-gray-400" />
                  ))}
                </div>
                {/*  */}
                <Skeleton className="w-55 h-10 rounded-xl  bg-gray-400" />
                {/*  */}                
              </div>       
            </Skeleton>
    </Container>   
  );
};   
