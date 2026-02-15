import React from "react";
import { Spinner } from "./Spinner";

interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message = "Загрузка..." }: FullScreenLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90"
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="xl" />
      <p className="mt-4 text-lg text-gray-700 font-medium">{message}</p>
    </div>
  );
}
