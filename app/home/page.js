"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/backend_link";
import Link from "next/link";

export default function HomePage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = Cookies.get("auth_token");
        const userName = Cookies.get("user_name");

        if (!token) return;

        const verify = async () => {
            try {
                const res = await api.post("/auth", { token });

                if (res.data.success) {
                    setUser(userName);
                } else {
                    Cookies.remove("auth_token");
                    Cookies.remove("user_name");
                    setUser(null);
                }
            } catch (err) {
                Cookies.remove("auth_token");
                Cookies.remove("user_name");
                setUser(null);
            }
        };

        verify();
    }, []);

    const handleLogout = () => {
        Cookies.remove("auth_token");
        Cookies.remove("user_name");
        setUser(null);
        router.push("/login");
    };

    const handleSearch = async () => {
        if (!search.trim()) return;

        setLoading(true);

        try {
            const res = await api.post("/product_list", {
                query: search,
                token: Cookies.get("auth_token"),
            });

            const data = res.data?.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Search error:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Top Bar */}
            <div className="w-full bg-[#1a1a1a] px-6 py-4 flex items-center justify-between shadow-md">
                <h1 className="text-lg font-semibold text-[#f5e6d3]">MyApp</h1>

                <div className="flex items-center gap-2 w-1/3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 px-4 py-2 rounded-lg bg-[#111] border border-gray-700 focus:outline-none focus:border-[#f5e6d3] focus:ring-2 focus:ring-[#f5e6d3]/20"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 rounded-lg bg-[#f5e6d3] text-black font-medium hover:bg-[#e8d5bb] transition"
                    >
                        Search
                    </button>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <a href="#" className="hover:text-[#f5e6d3]">
                        Home
                    </a>
                    <a href="#" className="hover:text-[#f5e6d3]">
                        Dashboard
                    </a>
                    <a href="#" className="hover:text-[#f5e6d3]">
                        Admin
                    </a>

                    {user ? (
                        <>
                            <span className="text-[#f5e6d3]">{user}</span>
                            <button
                                onClick={handleLogout}
                                className="text-red-400 hover:text-red-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => router.push("/login")}
                            className="bg-[#f5e6d3] text-black px-3 py-1 rounded-md hover:bg-[#e8d5bb]"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="p-6">
                {loading ? (
                    <p className="text-gray-400">Searching...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-500">
                        No results yet. Try searching.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((item) => (
                            <Link
                                key={item.pID}
                                href={`/product/${item.pID}`}
                                className="bg-[#1a1a1a] p-5 rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                <h3 className="text-lg font-semibold text-[#f5e6d3] mb-2">
                                    {item.product}
                                </h3>

                                <p className="text-gray-400 text-sm">
                                    Brand: {item.brand}
                                </p>

                                <p className="text-gray-400 text-sm">
                                    Category: {item.category}
                                </p>

                                <p className="text-white font-medium mt-2">
                                    ₹{item.price}
                                </p>

                                {/* URL */}
                                {item.url && (
                                    <img
                                        src={item.url}
                                        alt={item.product}
                                        className="w-full h-40 object-cover rounded-lg mt-3"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
