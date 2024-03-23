import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRepo } from '../api/getRepo';
import { starRepo } from '../api/starRepo';
import { RepoData, SearchCriteria } from '../api/types';
import { SearchRepoForm } from './SearchRepoForm';
import { FoundRepo } from './FoundRepo';
import { StarRepoButton } from './StarRepoButton';

export function RepoPage() {
  const [searchCriteria, setSearchCriteria] = useState<
    SearchCriteria | undefined
  >();

  const { data } = useQuery({
    queryKey: ['repo', searchCriteria],
    queryFn: function () {
      return getRepo(searchCriteria as SearchCriteria);
    },
    enabled: searchCriteria !== undefined, //!!!! this means if searchCriteria is not undefined, useQuery will call the queryFn, otherwise it won't. So when handleSearch is called, it'll set searchCriteria state, which will cause a rerender and since searchCriteria won't be undefined, it'll run the queryFn
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: starRepo,
    onSuccess: function () {
      queryClient.setQueryData<RepoData>(
        ['repo', searchCriteria],
        function (repo) {
          if (repo === undefined) {
            return undefined;
          }
          console.log(repo.repository.id);

          return {
            ...repo,
            viewerHasStarred: true,
          };
        }
      );
    },
  });

  function handleSearch(search: SearchCriteria) {
    setSearchCriteria(search);
  }

  function handleStarClick() {
    if (data) {
      mutate(data.repository.id); //the parameter will be passed to the starRepo function
    }
  }

  return (
    <main className='max-w-xs ml-auto mr-auto'>
      <SearchRepoForm onSearch={handleSearch} />
      {data && (
        <>
          <FoundRepo
            name={data.repository.name}
            description={data.repository.description}
            stars={data.repository.stargazers.totalCount}
          />
          {!data.repository.viewerHasStarred && (
            <StarRepoButton onClick={handleStarClick} />
          )}
        </>
      )}
    </main>
  );
}
