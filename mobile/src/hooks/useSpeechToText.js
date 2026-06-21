import { useState, useCallback } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

// Wraps the device's native speech recognition (Android SpeechRecognizer /
// iOS Speech framework) — on-device/OS-provided, no cloud API key needed,
// and both platforms have solid coverage for major Indian languages.
export function useSpeechToText(locale) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript;
    if (text) setTranscript(text);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setError(event.error || 'Speech recognition error');
  });

  const start = useCallback(async () => {
    setError(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone/speech permission denied');
      return false;
    }
    setTranscript('');
    ExpoSpeechRecognitionModule.start({ lang: locale, interimResults: true, continuous: false });
    return true;
  }, [locale]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { transcript, listening, error, start, stop };
}
