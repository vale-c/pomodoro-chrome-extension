import React, { useState, useEffect } from "react";

type SettingsModalProps = {
  setFocusDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  onClose: () => void;
}

export const SettingsModal = ({
  setFocusDuration,
  setBreakDuration,
  onClose,
}: SettingsModalProps) => {
  const [focusInput, setFocusInput] = useState("");
  const [breakInput, setBreakInput] = useState("");

  const [error, setError] = useState("");

  // useEffect to add the event listener for the escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    const newFocusDuration = parseInt(focusInput) * 60; // Convert minutes to seconds
    const newBreakDuration = parseInt(breakInput) * 60;

    if (
      isNaN(newFocusDuration) ||
      isNaN(newBreakDuration) ||
      newFocusDuration <= 0 ||
      newBreakDuration <= 0
    ) {
      setError("Please enter valid numbers.");
    } else {
      setFocusDuration(newFocusDuration);
      setBreakDuration(newBreakDuration);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white p-5 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="focus-duration"
              className="block text-sm font-medium text-gray-700"
            >
              Focus Duration (minutes):
            </label>
            <input
              type="number"
              id="focus-duration"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="break-duration"
              className="block text-sm font-medium text-gray-700"
            >
              Break Duration (minutes):
            </label>
            <input
              type="number"
              id="break-duration"
              value={breakInput}
              onChange={(e) => setBreakInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
