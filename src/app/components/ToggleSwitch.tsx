import React from 'react';

interface ToggleSwitchProps {
  color: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function ToggleSwitch({ color, label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${color}-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${color}-600`}></div>
      <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
    </label>
  );
} 