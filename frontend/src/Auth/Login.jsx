import { useState } from "react";
import AuthLayout from "../components/Layoutes/AuthLayout";
import Input from "../components/Inputs/Input";
import { Link, useNavigation } from "react-router";
import { validateEmail } from "../../utils/helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Enter a valid email.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }
  };

  return (
    <AuthLayout>
      <div className="w-full h-full flex flex-col justify-center px-8">
        <p className="font-semibold text-xl">Welcome, Please Login.</p>

        <form onSubmit={handleSubmit} className="mt-10">
          <Input
            label="Email"
            type="text"
            value={email}
            placeHolder="Enter your email"
            handleChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            placeHolder="Enter your password"
            handleChange={(e) => setPassword(e.target.value)}
          />

          <div className="h-4 text-red-500 text-xs mb-3">
            {error && <p>{error}</p>}
          </div>

          <button type="submit" className="btn-primary w-full">
            Log In
          </button>
        </form>

        <p className="text-xs mt-2">
          Don't have an account?
          <Link to="/signup" className="text-blue-800 underline">
            SignUp
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
