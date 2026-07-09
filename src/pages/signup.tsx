import { Link } from "react-router-dom";
import { useState } from "react";


export default function Signup() {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const [loading, setloading] = useState(false);

  const handlesubmit = async (e) => {
    e.preventDefault();

    setloading(true);
    setmessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already") ||
        error.message.toLowerCase().includes("exists")
      ) {
        setmessage("This account is already registered.");
      } else {
        setmessage(error.message);
      }

      setloading(false);
      return;
    }

    // when the user already exists.
    if (data.user?.identities?.length === 0) {
      setmessage("This account is already registered.");
      setloading(false);
      return;
    }

    setmessage("Registration successful. Please SignIn.");

    setname("");
    setemail("");
    setpassword("");
    setloading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 -translate-y-10">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Register your details.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100 text-center text-sm text-gray-700">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlesubmit} className="space-y-5">
          <input
            value={name}
            onChange={(e) => setname(e.target.value)}
            type="text"
            placeholder="Enter Your Name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            value={email}
            onChange={(e) => setemail(e.target.value)}
            type="email"
            placeholder="Enter Your Email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            type="password"
            placeholder="Enter Your Password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
            font-semibold hover:bg-blue-700 active:scale-95
            transition duration-300 shadow-md"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}