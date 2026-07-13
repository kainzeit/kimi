import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface GreetingProps {
  onEnter: () => void;
}

export default function Greeting({ onEnter }: GreetingProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: promptData } = trpc.greeting.getPrompt.useQuery();
  const verifyMutation = trpc.greeting.verify.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Store in sessionStorage so they don't need to re-enter on refresh
        sessionStorage.setItem("kimi-greeted", "yes");
        onEnter();
      } else {
        setError(true);
        setShaking(true);
        setValue("");
        setTimeout(() => setShaking(false), 500);
        setTimeout(() => setError(false), 2000);
      }
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    verifyMutation.mutate({ input: value.trim() });
  };

  const prompt = promptData?.prompt ?? "please say hi to enter";

  return (
    <div
      className="min-h-screen flex flex-col items-start justify-start bg-background text-foreground"
      style={{ paddingLeft: "152px", paddingTop: "95px" }}
    >
      <p
        className="text-sm mb-12 text-foreground/70"
        style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.02em" }}
      >
        {prompt}
      </p>

      <form onSubmit={handleSubmit} className="w-64">
        <div className={`relative ${shaking ? "animate-shake" : ""}`}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent border-0 border-b outline-none text-sm pb-1 text-foreground placeholder-transparent"
            style={{
              fontFamily: "'Space Mono', monospace",
              borderBottomColor: error ? "#ef4444" : "currentColor",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              transition: "border-color 0.2s",
            }}
          />
        </div>
        {error && (
          <p
            className="mt-2 text-xs text-red-400"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            try again
          </p>
        )}
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
