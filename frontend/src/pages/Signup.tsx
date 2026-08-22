import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:3000/auth/signUp", {
        name,
        email,
        password,
      });
      localStorage.setItem("access_token", response.data.access_token);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : (message ?? "Unable to create account."),
        );
      } else setError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Get started with your document workspace today.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="name"
          >
            Full name
          </label>
          <input
            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="name"
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            required
            type="text"
            value={name}
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            autoComplete="email"
            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <span className="text-xs text-slate-500">
              At least 8 characters
            </span>
          </div>
          <div className="relative">
            <input
              autoComplete="new-password"
              className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              id="password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute inset-y-0 right-3 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-600">
          <input
            className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            required
            type="checkbox"
          />
          <span>
            I agree to the{" "}
            <a
              className="font-medium text-blue-600 hover:text-blue-700"
              href="#terms"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="font-medium text-blue-600 hover:text-blue-700"
              href="#privacy"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          className="font-semibold text-blue-600 hover:text-blue-700"
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
