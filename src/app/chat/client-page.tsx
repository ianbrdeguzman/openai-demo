'use client';
import { Loader } from '@/components/Loader';
import { useEventSource } from '@/hooks/useEventSource';

export default function ChatPageClient() {
  const { sources, response, register, isLoading, isError, handleOnSubmit } =
    useEventSource();

  return (
    <main className="h-screen md:w-1/2 flex justify-center items-center flex-col">
      <h1 className="text-6xl my-4">OpenAI Demo</h1>
      <form
        onSubmit={handleOnSubmit}
        className="flex w-full justify-evenly mb-4 border-white border-2 relative"
      >
        <input
          className="text-black p-2 w-full"
          placeholder="Lorem ipsum?"
          {...register('query', { required: true })}
        />
        <button type="submit" className="p-2 bg-gray-500 min-w-[60px]">
          {isLoading ? <Loader /> : 'Send'}
        </button>
      </form>
      {response && (
        <div className="bg-gray-600 p-4">
          <p className="text-center ">{response}</p>
          {!/^Sorry, I don't know how to help with that/i.test(response) &&
            sources.map((source) => {
              return (
                <a
                  key={source}
                  href={source}
                  target="_blank"
                  className="text-blue-500 block"
                >
                  {source}
                </a>
              );
            })}
        </div>
      )}
    </main>
  );
}
