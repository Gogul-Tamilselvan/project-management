import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { connectSupabase } from "@/services/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormDataType {
  email: string;
  password: string;
  loading: boolean;
}

export function SigninPage() {
  const [formData, setFormData] = useState<FormDataType>({
    email: "",
    password: "",
    loading: false,
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormData((prev) => ({
      ...prev,
      loading: true,
      message: "",
    }));

    const { data, error } = await connectSupabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        toast.error("Invalid email or password.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.info("Please verify your email before signing in.");
      }

      setFormData((prev) => ({
        ...prev,
        loading: false,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      loading: false,
      email: "",
      password: "",
    }));
    toast.success("Sign in successful.");

    setTimeout(() => {
      window.location.reload();
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="mx-auto h-[calc(100dvh-115px)] flex items-center justify-center px-4 -translate-y-10">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border border-border bg-card">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>

          <p className="mt-1 text-sm  text-muted-foreground">Sign in to access your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="su-email">
              Email <span className="text-red-500">*</span>{" "}
            </label>
            <Input
              id="su-email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              type="email"
              placeholder="Enter Your Email"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <label htmlFor="su-password">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="su-password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              type="password"
              placeholder="Enter Your Password"
              required
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={formData.loading} className="w-full">
            {formData.loading ? "Creating Account..." : "Sign in"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
