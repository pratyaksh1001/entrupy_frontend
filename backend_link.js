import axios from "axios";

export const api = axios.create({
    baseURL: process.env.BACK_END || "http://127.0.0.1:8000/",
    headers: {
        "Content-Type": "application/json",
    },
});
