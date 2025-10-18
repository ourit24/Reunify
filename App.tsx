
import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { generateHugImage } from './services/geminiService';

// Add a declaration for the aistudio object on the window
// FIX: The original anonymous type for `window.aistudio` caused a conflict with a
// pre-existing global `AIStudio` type. By explicitly declaring a global `AIStudio`
// interface, we leverage TypeScript's declaration merging to resolve the conflict.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyIsSet, setApiKeyIsSet] = useState<boolean>(false);

  // Check for API Key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setApiKeyIsSet(hasKey);
        } catch (e) {
            console.error("Could not check for API key", e);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to avoid race conditions and show the main UI.
        // The API call will fail if the user closes the dialog, which is handled.
        setApiKeyIsSet(true);
      } catch(e) {
        console.error("Could not open select key dialog", e);
      }
    }
  };


  const handleImage1Upload = useCallback((file: File) => {
    setImage1(file);
    setPreview1(URL.createObjectURL(file));
  }, []);

  const handleImage2Upload = useCallback((file: File) => {
    setImage2(file);
    setPreview2(URL.createObjectURL(file));
  }, []);

  const handleGenerate = async () => {
    if (!image1 || !image2) {
      setError('Please upload both images before generating.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultImageUrl = await generateHugImage(image1, image2);
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Please try again.';
      
      // Handle the specific error case for API key not found
      if (errorMessage.includes('Requested entity was not found.')) {
         setError('Your API Key appears to be invalid. Please select a valid key and try again.');
         setApiKeyIsSet(false); // Reset to show the key selection screen
      } else {
        setError(errorMessage);
      }

    } finally {
      setIsLoading(false);
    }
  };
  
  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (preview1) URL.revokeObjectURL(preview1);
      if (preview2) URL.revokeObjectURL(preview2);
    };
  }, [preview1, preview2]);

  if (!apiKeyIsSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans p-4 flex flex-col justify-center items-center text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
            Welcome to Reunify
          </h1>
          <p className="mb-6 text-slate-300">
            To get started, you'll need to select a Gemini API key. Your key is used only for this session and is not stored.
          </p>
          {error && <p className="text-red-400 mb-4">{error}</p>}
           <button
              onClick={handleSelectKey}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
              <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
                Select API Key
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-4">
              For information about billing, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">Gemini API billing documentation</a>.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Reunify
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Merge two people into one beautiful, realistic photo.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ImageUploader title="Person 1" onImageUpload={handleImage1Upload} imagePreviewUrl={preview1} />
            <ImageUploader title="Person 2" onImageUpload={handleImage2Upload} imagePreviewUrl={preview2} />
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleGenerate}
              disabled={!image1 || !image2 || isLoading}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Spinner /> Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                    </svg>
                    Reunify Images
                  </>
                )}
              </span>
            </button>
          </div>
          
          <div className="w-full p-4 bg-slate-800/50 rounded-lg min-h-[300px] flex justify-center items-center">
             {isLoading && (
              <div className="text-center text-slate-400">
                <Spinner large={true} />
                <p className="mt-4 text-lg">AI is working its magic... this can take a moment.</p>
                <p className="text-sm">Creating a realistic image from scratch is complex!</p>
              </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
            {generatedImage && !isLoading && (
              <div className="w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-center mb-4">Your Reunify Moment!</h3>
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="rounded-lg shadow-2xl shadow-black/50 w-full object-contain"
                />
              </div>
            )}
            {!generatedImage && !isLoading && !error && (
              <div className="text-center text-slate-500">
                <p>Your generated image will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
