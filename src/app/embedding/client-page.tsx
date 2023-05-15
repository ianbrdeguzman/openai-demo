'use client';
import { Loader } from '@/components/Loader';
import { useLoadEmbedding } from '@/hooks/useLoadEmbedding';
import { useSaveEmbedding } from '@/hooks/useSaveEmbedding';

export default function EmbeddingPageClient() {
  const {
    docs,
    register,
    isLoading: isLoadLoading,
    isError: isLoadError,
    handleOnSubmit,
  } = useLoadEmbedding();

  const {
    success,
    isLoading: isSaveLoading,
    isError: isSaveError,
    handleOnSave,
  } = useSaveEmbedding();

  return (
    <main className="h-screen md:w-1/2 flex justify-center items-center flex-col">
      <h1 className="text-6xl my-4">Embedding</h1>
      <form
        onSubmit={handleOnSubmit}
        className="flex w-full justify-evenly my-8 border-white border-2 relative"
      >
        <input
          className="text-black p-2 w-full"
          placeholder="e.g https://www.emrap.org/corependium/chapter/..."
          {...register('url', { required: true })}
        />
        <button type="submit" className="p-2 bg-gray-500 min-w-[60px]">
          {isLoadLoading ? <Loader /> : 'Send'}
        </button>
      </form>
      {docs ? (
        <div className="w-full">
          <div className="overflow-scroll h-[300px]">
            <pre>{JSON.stringify(docs, null, 2)}</pre>
          </div>
          <button
            className="p-2 bg-gray-500 my-4 w-full"
            onClick={() => handleOnSave({ docs })}
          >
            {isSaveLoading ? <Loader /> : success ? 'Success' : 'Save'}
          </button>
        </div>
      ) : null}
    </main>
  );
}
