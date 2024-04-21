import React, { useEffect } from "react";

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  // Handling the click outside of the modal content
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Add an event listener for the escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Only add the listener if the modal is open
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    // Cleanup the event listener when the component is unmounted or when isOpen changes
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]); // Dependencies ensure this setup is recalibrated when isOpen or onClose changes

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg text-lg space-y-4 max-w-xs w-full"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-xl font-semibold">How Pomodoro Works 🍅</h2>
        <p>
          The Pomodoro Technique consists of alternating sessions of focused
          work and short breaks to maximize productivity. 🕒
        </p>
        <ul>
          <li>
            <strong>Focus:</strong> Work for 25 minutes uninterrupted. 🔴
          </li>
          <li>
            <strong>Break:</strong> After each focus session, take a 5-minute
            break to relax. 🟢
          </li>
          <li>
            <strong>Long Break:</strong> Every four focus sessions, take a
            longer break of 15-30 minutes. ⏳
          </li>
        </ul>
        <p>
          Adjust the times according to your preferences in the settings. ⚙️
        </p>
        <p>
          Click 'Start' to begin a session, 'Pause' to pause the timer, and
          'Reset' to start the session over. ▶️⏸️🔄
        </p>
        <button
          className="ml-auto bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
