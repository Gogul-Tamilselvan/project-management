import { Link } from "react-router-dom";
import React, { useState } from "react";
import { connectSupabase } from "@/services/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormDataType {
  name: string;
  email: string;
  password: string;
  loading: boolean;
}

export function SignupPage() {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    loading: false,
  });

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormData((prev) => ({
      ...prev,
      loading: true,
    }));

    const { data, error } = await connectSupabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already") ||
        error.message.toLowerCase().includes("exists")
      ) {
        toast.error("This account is already registered.");
      } else {
        toast.error(error.message);
      }
      setFormData((prev) => ({
        ...prev,
        loading: false,
      }));
      return;
    }
    // when the user already exists.
    if (data.user?.identities?.length === 0) {
      toast.error("This account is already registered.");
      return;
    }
    toast.success("Registration successful. Please SignIn.");
    setFormData((prev) => ({
      ...prev,
      name: "",
      email: "",
      password: "",
      loading: false,
    }));
  };

  return (
    <div className=" h-[calc(100dvh-115px)] flex items-center justify-center px-4 -translate-y-10">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border border-border bg-card">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>

          <p className="mt-1 text-sm text-muted-foreground">Register your details.</p>
        </div>

        {/* Form */}
        <form onSubmit={handlesubmit} className="space-y-4">
          <div>
            <label htmlFor="su-name">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              type="text"
              placeholder="Enter Your Name"
              required
              id="su-name"
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="su-email">Email</label>
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
            <label htmlFor="su-password">Password</label>
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
            {formData.loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
