"use client";

import { useState } from "react";
import { api } from "@/backend_link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/login", form);

            if (res.data.success) {
                const token = res.data.token;
                if (token) {
                    Cookies.set("auth_token", token);
                    Cookies.set("user_name", res.data.user_name);
                }

                console.log("Login success:", res.data);
                router.push("/home");
            } else {
                setError(res.data.message || "Login failed");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
            <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold text-center text-[#f5e6d3] mb-6">
                    Welcome Back
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-[#f5e6d3] focus:ring-2 focus:ring-[#f5e6d3]/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-[#f5e6d3] focus:ring-2 focus:ring-[#f5e6d3]/20"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-[#f5e6d3] text-black font-semibold hover:bg-[#e8d5bb] transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className="text-[#f5e6d3] hover:underline"
                    >
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
