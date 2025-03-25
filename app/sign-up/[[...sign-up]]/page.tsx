import React from "react";
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="mt-15 px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto flex justify-center align-center">
      <SignUp signInFallbackRedirectUrl="/create-profile" />
      {/* the signInFallbackRedirectUrl is from clerk */}
    </div>
  );
};

export default SignUpPage;
