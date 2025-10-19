'use client';

import React, { useEffect, useState } from 'react';
import { Container } from './container';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import ReactStories from 'react-insta-stories';
import { Api } from '../../../services/api-client';
import { IStory } from '../../../services/stories';

interface Props {
  className?: string;
}

export const Stories: React.FC<Props> = ({ className }) => {
  const [stories, setStories] = useState<IStory[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<IStory>();

  // адаптивные размеры (поддерживаем целевое соотношение 520x800)
  const [dims, setDims] = useState({ width: 520, height: 800 });
  // const target = useMemo(() => ({ w: 520, h: 800, ratio: 520 / 800 }), []);

  useEffect(() => {
    async function fetchStories() {
      const data = await Api.stories.getAll();
      setStories(data);
    }

    fetchStories();
  }, []);

  // перерасчёт размеров при открытии и ресайзе окна
  // useEffect(() => {
  // 	if (!open) return;

  // 	const calc = () => {
  // 		const pad = 32;
  // 		const maxW = Math.max(280, Math.min(target.w, window.innerWidth - pad));
  // 		const maxH = Math.max(420, Math.min(target.h, window.innerHeight - pad));

  // 		// сначала
  // 		let w = Math.round(maxW);
  // 		let h = Math.round(w / target.ratio);

  // 		// если по высоте не помещается — подстраиваемся по высоте
  // 		if (h > maxH) {
  // 			h = Math.round(maxH);
  // 			w = Math.round(h * target.ratio);
  // 		}
  // 		setDims({ width: w, height: h });
  // 	};

  // 	calc();
  // 	window.addEventListener("resize", calc);
  // 	return () => window.removeEventListener("resize", calc);
  // }, [open, target.ratio, target.h, target.w]);

  useEffect(() => {
    const ratio = 520 / 800;
    const pad = 32;
    const maxW = Math.max(280, Math.min(520, window.innerWidth - pad));
    const maxH = Math.max(420, Math.min(800, window.innerHeight - pad));

    let w = Math.round(maxW);
    let h = Math.round(w / ratio);

    if (h > maxH) {
      h = Math.round(maxH);
      w = Math.round(h * ratio);
    }

    setDims({ width: w, height: h });
  }, []);

  const onClickStory = (story: IStory) => {
    setSelectedStory(story);
    if (story.items.length > 0) setOpen(true);
  };

  return (
    <Container
      className={cn('flex items-center justify-between gap-2 my-10 overflow-x-auto', className)}
    >
      {stories.length === 0 &&
        [...Array(6)].map((_, index) => (
          <div key={index} className="w-[200px] h-[250px] bg-gray-200 rounded-md animate-pulse" />
        ))}

      {stories.map(story => (
        <img
          key={story.id}
          onClick={() => onClickStory(story)}
          className="rounded-md cursor-pointer"
          height={250}
          width={200}
          src={story.previewImageUrl}
          alt={`Story ${story.id}`}
          loading="lazy"
        />
      ))}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative"
            style={{ width: dims.width }}
          >
            <button className="absolute -right-2 -top-7 z-50" onClick={() => setOpen(false)}>
              <X className="w-8 h-8 text-white/70 hover:text-white transition-colors" />
            </button>

            <ReactStories
              onAllStoriesEnd={() => setOpen(false)}
              stories={selectedStory?.items.map(item => ({ url: item.sourceUrl })) || []}
              defaultInterval={3000}
              width={dims.width}
              height={dims.height}
            />
          </div>
        </div>
      )}
    </Container>
  );
};
