"use client";

import { useState } from "react";
import { api } from "@/backend_link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
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
            const res = await api.post("/register", form);
            console.log(res.message);
            router.push("/login");
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
            <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold text-center text-[#f5e6d3] mb-6">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-[#f5e6d3] focus:ring-2 focus:ring-[#f5e6d3]/20"
                            required
                        />
                    </div>

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
                            Age
                        </label>
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            placeholder="Enter your age"
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
                            placeholder="Enter password"
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
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{" "}
                    <a href="#" className="text-[#f5e6d3] hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
