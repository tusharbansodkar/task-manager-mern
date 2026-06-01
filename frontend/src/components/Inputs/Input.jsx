import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

const Input = ({ label, value, type, placeHolder, handleChange }) => {
  const [showPassword, SetShowPassword] = useState(false);

  const handleClick = () => {
    SetShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col mb-3 relative">
      <label htmlFor="">{label}</label>
      <input
        value={value}
        type={type === "password" ? (showPassword ? "text" : "password") : type}
        placeholder={placeHolder}
        onChange={handleChange}
        className="input-style"
      />

      {type === "password" && (
        <button
          type="button"
          className="absolute text-primary/80 right-2 top-3/4 transform -translate-y-3/4 text-lg cursor-pointer"
          onClick={handleClick}
        >
          {showPassword ? <LuEyeOff /> : <LuEye />}
        </button>
      )}
    </div>
  );
};

export default Input;
