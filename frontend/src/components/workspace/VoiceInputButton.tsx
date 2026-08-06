import * as React from "react";
import { Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SpeechRecognitionResultLike {
  transcript: string;
}

export function VoiceInputButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleListening = () => {
    if (!supported) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: { results: ArrayLike<{ 0: SpeechRecognitionResultLike }> }) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "outline"}
      size="icon"
      onClick={toggleListening}
      disabled={!supported}
      title={supported ? "Voice input" : "Voice input not supported in this browser"}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
