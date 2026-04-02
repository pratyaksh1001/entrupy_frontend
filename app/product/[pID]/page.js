"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/backend_link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
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
                // auth check
                const authRes = await api.post("/auth", { token });

                if (!authRes.data.success) {
                    Cookies.remove("auth_token");
                    Cookies.remove("user_name");
                    router.push("/login");
                    return;
                }

                setUser(userName);

                // fetch product data
                const res = await api.get(`/product/${pID}`, {
                    params: { token },
                });

                setImages(res.data.images || []);
                setProduct(res.data.product || null);

                setHistory(
                    (res.data.history || []).map((h) => ({
                        date: new Date(h[0]).toLocaleDateString(),
                        price: h[1],
                    })),
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [pID]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0f0f0f] text-white p-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* LEFT SECTION */}
                <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2">
                    {/* Main Image */}
                    {images[0] && (
                        <img
                            src={images[0]}
                            alt="product"
                            className="w-full h-[350px] object-cover rounded-xl"
                        />
                    )}

                    {/* Product Details */}
                    {product && (
                        <div className="bg-[#1a1a1a] p-4 rounded-xl shadow-lg">
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

                    {/* Price Graph */}
                    <div className="bg-[#1a1a1a] p-4 rounded-xl shadow-lg">
                        <h3 className="text-lg text-[#f5e6d3] mb-3">
                            Price History
                        </h3>

                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <XAxis dataKey="date" stroke="#aaa" />
                                    <YAxis stroke="#aaa" />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#f5e6d3"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl shadow-lg overflow-y-auto">
                    <h3 className="text-lg text-[#f5e6d3] mb-4">More Images</h3>

                    <div className="grid grid-cols-2 gap-3">
                        {images.slice(1).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="product"
                                className="w-full h-28 object-cover rounded-md hover:scale-105 transition"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
