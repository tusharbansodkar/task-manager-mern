import React, { useState } from "react";
import AuthLayout from "../components/Layoutes/AuthLayout";
import ProfileImageSelector from "../components/Inputs/ProfileImageSelector";
import Input from "../components/Inputs/Input";
import { Link } from "react-router";
import { validateEmail } from "../../utils/helper";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");

  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Enter a valid email.");
      return;
    }

    if (!fullName) {
      setError("Enter your full name.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }
  };

  return (
    <AuthLayout>
      <div className="w-full h-full p-3">
        <p className="font-semibold text-xl">Create an Account.</p>

        <form onSubmit={handleSubmit} className="mt-2">
          <ProfileImageSelector image={profilePic} setImage={setProfilePic} />

          <Input
            label="Full Name"
            type="text"
            value={fullName}
            placeHolder="Enter your Full Name"
            handleChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email"
            type="text"
            value={email}
            placeHolder="Enter your Email"
            handleChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            placeHolder="Enter your Password"
            handleChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Admin Token"
            type="text"
            value={adminInviteToken}
            placeHolder="Enter the Admin Token"
            handleChange={(e) => setAdminInviteToken(e.target.value)}
          />

          <div className="h-3 text-red-500 text-xs mb-2">
            {error && <p>{error}</p>}
          </div>

          <button type="submit" className="btn-primary w-full">
            Sign Up
          </button>
        </form>

        <p className="text-xs mt-2">
          Already have an account?
          <Link to="task-manager-mern/" className="text-blue-800 underline">
            LogIn
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
