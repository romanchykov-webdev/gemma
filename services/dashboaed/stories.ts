import {
  CreateStoryData,
  Story,
  UpdateStoryData,
} from '../../src/app/(dashboard)/dashboard/components/shared/stories/stories-types';
import { axiosInstance } from '../instance';

export const getStories = async (): Promise<Story[]> => {
  const { data } = await axiosInstance.get<Story[]>('/dashboaed/stories');
  return data;
};

export const createStory = async (storyData: CreateStoryData): Promise<Story> => {
  const { data } = await axiosInstance.post<Story>('/dashboaed/stories', storyData);
  return data;
};

export const updateStory = async (id: number, storyData: UpdateStoryData): Promise<Story> => {
  const { data } = await axiosInstance.patch<Story>(`/dashboaed/stories/${id}`, storyData);
  return data;
};

export const deleteStory = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboaed/stories/${id}`);
};
