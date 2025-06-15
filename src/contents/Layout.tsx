// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Disclosure } from "@headlessui/react";
// import { Language } from "./Language";
// import { useState } from "react";
// import { LanguageType } from "@/lib/model";
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable";
// import { CodeEditor } from "./CodeEditor";
// import { Input } from "./Input";
// import { Output } from "./Output";
// import toast, { Toaster } from "react-hot-toast";
// import { useTheme } from "@/components/theme-provider";
// import { SunIcon } from "@/components/ui/sunIcon";
// import { MoonIcon } from "@/components/ui/moonIcon";
// import { geminiReview } from "@/contents/gemini";

// export default function Layout() {
//   const [selectedLanguage, setSelectedLanguage] = useState<
//     LanguageType | undefined
//   >();
//   const [code, setCode] = useState<string>("");
//   const [input, setInput] = useState<string | undefined>("");
//   const [output, setOutput] = useState<string>("");
//   const [analysis, setAnalysis] = useState<string>("");

//   const { theme, setTheme } = useTheme();
//   const [isAnimating, setIsAnimating] = useState(false);

//   const toggleTheme = () => {
//     setIsAnimating(true);
//     setTheme(theme === "dark" ? "light" : "dark");
//     setTimeout(() => setIsAnimating(false), 100);
//   };
//   const [color, setColor] = useState<string>("");

//   const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
//   const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

//   const handleLanguageChange = (language: LanguageType | undefined) => {
//     setSelectedLanguage(language);
//   };

//   const handleRun = async () => {
//     let output: string = "";

//     if (input == "") {
//       setInput(undefined);
//     }

//     if (code == "") {
//       toast.error("no code to run");
//       return null;
//     }

//     console.log("input", input);

//     const postUrl = "https://judge0-ce.p.rapidapi.com/submissions";
//     const postOptions = {
//       method: "POST",
//       headers: {
//         "x-rapidapi-key": apiKey,
//         "x-rapidapi-host": apiHost,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         language_id: selectedLanguage?.id, // Ensure this is serialized as JSON
//         source_code: code, // Code from the editor
//         stdin: input,
//       }),
//     };

//     try {
//       toast.loading("code submitted, waiting for response from server", {
//         id: "running",
//       });
//       const response = await fetch(postUrl, postOptions);
//       if (response.status === 429) {
//         toast.dismiss("running");
//         throw new Error("request limit exceed ");
//       }
//       const result = await response.text();

//       const token = JSON.parse(result).token;

//       const getUrl = `https://judge0-ce.p.rapidapi.com/submissions/${token}`;
//       const getOptions = {
//         method: "GET",
//         headers: {
//           "x-rapidapi-key": apiKey,
//           "x-rapidapi-host": apiHost,
//         },
//       };

//       let parsedResult = await fetchSubmissionResult(getUrl, getOptions);

//       while (parsedResult.status.id === 1 || parsedResult.status.id === 2) {
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//         parsedResult = await fetchSubmissionResult(getUrl, getOptions);
//       }

//       if (parsedResult.status.id === 11) {
//         output = "Runtime Error" + `\n \n` + parsedResult.stderr;
//         setColor("text-red-600");
//         toast.error("runtime error occured", { id: "running" });
//       } else if (parsedResult.status.id != 3) {
//         output = parsedResult.compile_output;
//         setColor("text-yellow-400");
//         toast.error("failed code", { id: "running" });
//       } else {
//         if (parsedResult.compile_output == null) {
//           output = parsedResult.stdout;
//           toast.error("runtime error occured", { id: "running" });
//         } else {
//           output = parsedResult.stdout + `\n \n` + parsedResult.compile_output;
//         }
//         setColor("text-green-400")
//         toast.success("code ran successfully", { id: "running" });
//       }

//       setOutput(output);

//       const analysis = await geminiReview(code, output);
//       setAnalysis(analysis);
//     } catch (error: unknown) {
//       console.log(error);

//       if (error instanceof Error) {
//         toast.error(error.message); // Now it's safe to access error.message
//       } else {
//         toast.error("An unexpected error occurred.");
//       }
//     }
//   };

//   const fetchSubmissionResult = async (url: string, options: any) => {
//     try {
//       const submission = await fetch(url, options);
//       const submissionResult = await submission.text();
//       const parsedResult = JSON.parse(submissionResult);
//       return parsedResult;
//     } catch (error) {
//       console.log(error);
//       toast.error("error occured while fetching result");
//       return null;
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen flex flex-col transition-colors duration-300">
//         <Disclosure as="nav" className="bg-gray-800">
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="flex h-16 items-center justify-end">
//               <button
//                 onClick={toggleTheme}
//                 className="bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center"
//                 aria-label={`Change to ${
//                   theme === "dark" ? "light" : "dark"
//                 } mode`}
//               >
//                 <div className="max-w-6">
//                   {theme === "dark" ? (
//                     <MoonIcon
//                       className={`transition-transform duration-500 ${
//                         isAnimating ? "rotate-180" : ""
//                       }`}
//                     />
//                   ) : (
//                     <SunIcon
//                       className={`transition-transform duration-500 ${
//                         isAnimating ? "rotate-180" : ""
//                       }`}
//                     />
//                   )}
//                 </div>
//               </button>
//             </div>
//           </div>
//         </Disclosure>

//         <header className="bg-black shadow">
//           <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
//             <Language onLanguageSelect={handleLanguageChange} />
//             <button
//               onClick={handleRun}
//               className="bg-green-500 text-white py-2 px-4 rounded"
//             >
//               Run
//             </button>
//           </div>
//         </header>
//         <main className="flex-1 p-4">
//           <div className="px-4 py-6 sm:px-6 lg:px-8">
//             <ResizablePanelGroup
//               direction="horizontal"
//               className="rounded-lg border md:min-w-[450px]"
//             >
//               <ResizablePanel defaultSize={60} className="h-screen">
//                 <div className="flex p-6">
//                   <CodeEditor
//                     selectedLanguage={selectedLanguage}
//                     code={code}
//                     setCode={setCode}
//                   />
//                 </div>
//               </ResizablePanel>
//               <ResizableHandle />
//               <ResizablePanel defaultSize={40}>
//                 <ResizablePanelGroup direction="vertical">
//                   <ResizablePanel defaultSize={25}>
//                     <div className="flex h-full p-6">
//                       <Input input={input} setInput={setInput} />
//                     </div>
//                   </ResizablePanel>
//                   <ResizableHandle />
//                   <ResizablePanel defaultSize={75}>
//                       <div className="flex h-full p-6 flex-col w-full">
//   <Output output={output} color={color} />
  
//   {analysis && (
//     <div className="mt-6 p-4 border rounded shadow bg-white dark:bg-zinc-900 w-full">
//       <h2 className="text-xl font-semibold mb-2">AI Explanation and Suggestions</h2>
//       <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
//     </div>
//   )}
// </div>
//                   </ResizablePanel>
//                 </ResizablePanelGroup>
//               </ResizablePanel>
//             </ResizablePanelGroup>
//           </div>
//         </main>
//         <Toaster />
//       </div>
//     </>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Disclosure } from "@headlessui/react";
import { Language } from "./Language";
import { useState } from "react";
import { LanguageType } from "@/lib/model";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CodeEditor } from "./CodeEditor";
import { Input } from "./Input";
import { Output } from "./Output";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "@/components/theme-provider";
import { SunIcon } from "@/components/ui/sunIcon";
import { MoonIcon } from "@/components/ui/moonIcon";
import { geminiReview } from "@/contents/gemini";

function cleanAIOutput(output: string): string {
  return output
    .replace(/^##+\s?/gm, "")                // Remove markdown headers like ##, ### etc.
    .replace(/["'`]+/g, "")                  // Remove quotes and backticks
    .replace(/\*\*(.*?)\*\*/g, "$1")         // Remove **bold** markdown
    .replace(/\*(.*?)\*/g, "$1")             // Remove *italic* markdown
    .replace(/__([^_]+)__/g, "$1")           // Remove __underline__ markdown
    .replace(/^\s*[-*+]\s+/gm, "- ")          // Normalize list bullets
    .replace(/\n{3,}/g, "\n\n")              // Collapse multiple newlines
    .trim();                                 // Trim whitespace
}

export default function Layout() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>();
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string | undefined>("");
  const [output, setOutput] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setIsAnimating(false), 100);
  };

  const [color, setColor] = useState<string>("");

  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

  const handleLanguageChange = (language: LanguageType | undefined) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    let output: string = "";

    if (input === "") {
      setInput(undefined);
    }

    if (code === "") {
      toast.error("No code to run");
      return;
    }

    const postUrl = "https://judge0-ce.p.rapidapi.com/submissions";
    const postOptions = {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: selectedLanguage?.id,
        source_code: code,
        stdin: input,
      }),
    };

    try {
      toast.loading("Submitting code...", { id: "running" });

      const response = await fetch(postUrl, postOptions);
      if (response.status === 429) {
        toast.dismiss("running");
        throw new Error("Request limit exceeded");
      }

      const result = await response.json();
      const token = result.token;

      const getUrl = `https://judge0-ce.p.rapidapi.com/submissions/${token}`;
      const getOptions = {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost,
        },
      };

      let parsedResult = await fetchSubmissionResult(getUrl, getOptions);
      while (parsedResult.status.id === 1 || parsedResult.status.id === 2) {
        await new Promise((res) => setTimeout(res, 3000));
        parsedResult = await fetchSubmissionResult(getUrl, getOptions);
      }

      if (parsedResult.status.id === 11) {
        output = "Runtime Error:\n\n" + parsedResult.stderr;
        setColor("text-red-600");
        toast.error("Runtime error occurred", { id: "running" });
      } else if (parsedResult.status.id !== 3) {
        output = parsedResult.compile_output;
        setColor("text-yellow-400");
        toast.error("Compilation failed", { id: "running" });
      } else {
        output = parsedResult.stdout;
        setColor("text-green-400");
        toast.success("Code ran successfully", { id: "running" });
      }

      setOutput(output);

      const rawAnalysis = await geminiReview(code, output);
      const analysis = cleanAIOutput(rawAnalysis);
      setAnalysis(analysis);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const fetchSubmissionResult = async (url: string, options: any) => {
    try {
      const submission = await fetch(url, options);
      const parsed = await submission.json();
      return parsed;
    } catch (error) {
      console.error(error);
      toast.error("Error fetching result");
      return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-end">
            <button
              onClick={toggleTheme}
              className="bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center"
              aria-label={`Change to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <div className="max-w-6">
                {theme === "dark" ? (
                  <MoonIcon className={`transition-transform duration-500 ${isAnimating ? "rotate-180" : ""}`} />
                ) : (
                  <SunIcon className={`transition-transform duration-500 ${isAnimating ? "rotate-180" : ""}`} />
                )}
              </div>
            </button>
          </div>
        </div>
      </Disclosure>

      {/* Header */}
      <header className="bg-black shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Language onLanguageSelect={handleLanguageChange} />
          <button onClick={handleRun} className="bg-green-500 text-white py-2 px-4 rounded">
            Run
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={60} className="overflow-y-auto">
              <div className="p-4 h-full">
                <CodeEditor selectedLanguage={selectedLanguage} code={code} setCode={setCode} />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <ResizablePanelGroup direction="vertical" className="h-full w-full">
                <ResizablePanel defaultSize={25} className="overflow-y-auto">
                  <div className="p-4 h-full">
                    <Input input={input} setInput={setInput} />
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75} className="overflow-y-auto">
                  <div className="p-4 flex flex-col h-full">
                    <Output output={output} color={color} />
                    {analysis && (
                      <div className="mt-6 p-4 border rounded shadow bg-white dark:bg-zinc-900 w-full overflow-auto">
                        <h2 className="text-xl font-semibold mb-2">AI Explanation and Suggestions</h2>
                        <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
