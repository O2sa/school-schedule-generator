import { toast } from 'react-toastify';
import { LevelsContainer } from '../components';
import customFetch from '../utils/customFetch';
import { useLoaderData } from 'react-router-dom';
import { useContext, createContext } from 'react';
import { useQuery } from '@tanstack/react-query';

const LevelsQuery = (params) => {
  const { search, jobStatus, jobType, sort, page } = params;
  return {
    queryKey: [
      'levels',
      search ?? '',
      jobStatus ?? 'all',
      jobType ?? 'all',
      sort ?? 'newest',
      page ?? 1,
    ],
    queryFn: async () => {
      const { data } = await customFetch.get('/levels', {
        params,
      });
      return data;
    },
  };
};

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);
    await queryClient.ensureQueryData(LevelsQuery(params));
    return { searchValues: { ...params } };
  };

const LevelsContext = createContext();
const Levels = () => {
  const { searchValues } = useLoaderData();
  const { data } = useQuery(LevelsQuery(searchValues));
  return (
    <LevelsContext.Provider value={{ data, searchValues }}>
      {/* <SearchContainerLevels /> */}
      <LevelsContainer />
    </LevelsContext.Provider>
  );
};

export const useLevelsContext = () => useContext(LevelsContext);
export default Levels;
