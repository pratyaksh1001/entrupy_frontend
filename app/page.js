"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center space-y-6">
                <h1 className="text-2xl md:text-3xl text-[#f5e6d3] font-semibold leading-relaxed">
                    Greetings to the user,
                    <br />I hope you have a good experience while evaluating.
                </h1>

                <button
                    onClick={() => router.push("/home")}
                    className="mt-4 px-6 py-3 rounded-xl bg-[#f5e6d3] text-black font-medium hover:bg-[#e8d5bb] transition"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
