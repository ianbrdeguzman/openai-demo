import useSWRMutation from 'swr/mutation';

async function saveEmbedding(url: string, { arg }: { arg: { docs: any[] } }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  return await res.json();
}

export function useSaveEmbedding() {
  const { trigger, isMutating, data, error } = useSWRMutation(
    '/api/embedding-save',
    saveEmbedding
  );

  return {
    success: data?.success,
    isLoading: isMutating,
    isError: error,
    handleOnSave: trigger,
  };
}
