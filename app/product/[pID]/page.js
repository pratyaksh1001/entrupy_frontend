"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/backend_link";
import Link from "next/link";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

export default function ProductPage() {
    const router = useRouter();
    const { pID } = useParams();

    const [user, setUser] = useState(null);
    const [images, setImages] = useState([]);
    const [history, setHistory] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get("auth_token");
        const userName = Cookies.get("user_name");

        if (!token) {
            router.push("/login");
            return;
        }

        const init = async () => {
            try {
                const authRes = await api.post("/auth", { token });

                if (!authRes.data.success) {
                    Cookies.remove("auth_token");
                    Cookies.remove("user_name");
                    router.push("/login");
                    return;
                }

                setUser(userName);

                const res = await api.post(`/product/${pID}`, { token });

                setImages(res.data.images || []);
                setProduct(res.data.product || null);

                const rawData = res.data.data || [];

                const formatted = rawData.map((item) => {
                    const time = Object.keys(item)[0];
                    const price = item[time];

                    return {
                        date: new Date(time).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                        }),
                        price,
                        rawTime: new Date(time),
                    };
                });

                formatted.sort((a, b) => a.rawTime - b.rawTime);
                setHistory(formatted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [pID]);

    const handleLogout = () => {
        Cookies.remove("auth_token");
        Cookies.remove("user_name");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f0f0f] text-white">
            {/* TOP BAR */}
            <div className="w-full bg-[#1a1a1a] px-6 py-4 flex items-center justify-between border-b border-gray-800">
                <h1 className="text-[#f5e6d3] font-semibold text-lg">
                    Entrupy
                </h1>

                <div className="flex gap-6 items-center text-sm">
                    <Link href="/home" className="hover:text-[#f5e6d3]">
                        Home
                    </Link>
                    <Link href="/admin_login" className="hover:text-[#f5e6d3]">
                        Admin
                    </Link>

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
                            className="bg-[#f5e6d3] text-black px-3 py-1 rounded-md"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {/* MAIN IMAGE */}
                    {images[0] && (
                        <div className="w-full h-[420px] bg-[#111] rounded-xl flex items-center justify-center overflow-hidden">
                            <img
                                src={images[0]}
                                alt="product"
                                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                    )}

                    {/* DETAILS */}
                    {product && (
                        <div className="bg-[#1a1a1a] p-5 rounded-xl">
                            <h2 className="text-xl font-semibold text-[#f5e6d3] mb-2">
                                {product.product}
                            </h2>

                            <p className="text-gray-400 text-sm">
                                Brand: {product.brand}
                            </p>
                            <p className="text-gray-400 text-sm">
                                Category: {product.category}
                            </p>

                            <p className="text-white text-lg font-medium mt-2">
                                ${product.price}
                            </p>
                        </div>
                    )}

                    {/* GRAPH */}
                    <div className="bg-[#1a1a1a] p-6 rounded-xl">
                        <h3 className="text-[#f5e6d3] mb-4">Price History</h3>

                        <div className="w-full h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid stroke="#333" />
                                    <XAxis dataKey="date" stroke="#aaa" />
                                    <YAxis stroke="#aaa" />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#111",
                                            border: "1px solid #444",
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#f5e6d3"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT IMAGES */}
                <div className="w-80 bg-[#1a1a1a] p-4 overflow-y-auto border-l border-gray-800">
                    <h3 className="text-[#f5e6d3] mb-4">More Images</h3>

                    <div className="flex flex-col gap-4">
                        {images.slice(1).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="product"
                                onClick={() => {
                                    const newImages = [
                                        img,
                                        ...images.filter((i) => i !== img),
                                    ];
                                    setImages(newImages);
                                }}
                                className="w-full h-40 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
