import useSWRMutation from 'swr/mutation';
import { SubmitHandler, useForm } from 'react-hook-form';

async function loadEmbedding(url: string, { arg }: { arg: { url: string } }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  return await res.json();
}

export function useLoadEmbedding() {
  const { register, handleSubmit, reset } = useForm<{ url: string }>();
  const { trigger, isMutating, data, error } = useSWRMutation(
    '/api/embedding-load',
    loadEmbedding
  );

  const handleOnSubmit: SubmitHandler<{ url: string }> = async ({ url }) => {
    trigger({ url });
    reset();
  };

  return {
    docs: data?.docs,
    register,
    isLoading: isMutating,
    isError: error,
    handleOnSubmit: handleSubmit(handleOnSubmit),
  };
}
