import useSWR from 'swr';
import { getCategories, type CategoryItem } from '@/api/quiz';

type UseCategoriesReturn = {
  categories: CategoryItem[] | undefined;
  isLoading: boolean;
  error: unknown;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

const useCategories = (): UseCategoriesReturn => {
  const { data, isLoading, error } = useSWR('categories', getCategories, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: ONE_HOUR_MS,
  });

  return { categories: data, isLoading, error };
};

export default useCategories;
