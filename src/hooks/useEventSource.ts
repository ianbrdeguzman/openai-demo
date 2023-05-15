import useSWRMutation from 'swr/mutation';
import { Dispatch, SetStateAction, useState } from 'react';
import { SubmitHandler, UseFormReset, useForm } from 'react-hook-form';
import { fetchEventSource } from '@microsoft/fetch-event-source';

async function fetchCompletion(
  url: string,
  {
    arg: { query, setSources, setResponse, setIsResponding, reset },
  }: {
    arg: {
      query: string;
      setSources: Dispatch<SetStateAction<string[]>>;
      setResponse: Dispatch<SetStateAction<string>>;
      setIsResponding: Dispatch<SetStateAction<boolean>>;
      reset: UseFormReset<{ query: string }>;
    };
  }
) {
  setSources([]);
  setResponse('');
  setIsResponding(true);

  fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    onmessage: (e) => {
      const isDone = e.data.startsWith('DONE');
      if (isDone) {
        const sources = e.data.split(' ')[1].split(',');
        setSources(sources);
      } else {
        setResponse((prev) => (prev += e.data));
      }
    },
    onclose: () => {
      setIsResponding(false);
      reset();
    },
  });
}

export function useEventSource() {
  const [sources, setSources] = useState<string[]>([]);
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ query: string }>();
  const { trigger, error } = useSWRMutation('/api/completion', fetchCompletion);

  const handleOnSubmit: SubmitHandler<{ query: string }> = async ({
    query,
  }) => {
    trigger({ query, setSources, setResponse, setIsResponding, reset });
  };

  return {
    sources,
    response,
    register,
    isLoading: isResponding,
    isError: error,
    handleOnSubmit: handleSubmit(handleOnSubmit),
  };
}
