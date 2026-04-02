"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/backend_link";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
    const router = useRouter();

    const [tables, setTables] = useState([]);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState("");

    const [selectedColumn, setSelectedColumn] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const token = Cookies.get("auth_token");

        if (!token) {
            router.push("/home");
            return;
        }

        const init = async () => {
            try {
                const res = await api.post("/admin_auth", { token });

                if (!res.data.success) {
                    router.push("/home");
                    return;
                }

                const tableRes = await api.get("/tables", {
                    params: { token },
                });

                setTables(tableRes.data.tables || []);
            } catch {
                router.push("/home");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const fetchTable = async (table) => {
        try {
            setActiveTable(table);
            setSelectedColumn(null);

            const res = await api.post(`/${table}`, {
                token: Cookies.get("auth_token"),
            });

            const rows = res.data?.data || [];
            const cols = res.data?.columns || [];

            const formatted = rows.map((row) => {
                let obj = {};
                cols.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            });

            setColumns(cols);
            setData(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!selectedColumn || !search) return;

        try {
            const res = await api.post("/admin/search", {
                table: activeTable,
                column: selectedColumn,
                query: search,
                token: Cookies.get("auth_token"),
            });

            const rows = res.data?.data || [];
            const cols = res.data?.columns || columns;

            const formatted = rows.map((row) => {
                let obj = {};
                cols.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            });

            setData(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (row, colName) => {
        setEditingCell({ pID: row.pID, colName });
        setEditValue(row[colName]);
    };

    const handleSave = async (row, colName) => {
        try {
            await api.post("/admin/update", {
                table: activeTable,
                column: colName,
                value: editValue,
                pID: row.pID,
                token: Cookies.get("auth_token"),
            });

            const newData = data.map((item) =>
                item.pID === row.pID ? { ...item, [colName]: editValue } : item,
            );

            setData(newData);
        } catch (err) {
            console.error(err);
        } finally {
            setEditingCell(null);
        }
    };

    const handleLogout = () => {
        Cookies.remove("auth_token");
        Cookies.remove("user_name");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f0f0f] text-white">
            <div className="w-full bg-[#1a1a1a] px-8 py-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex gap-3 w-1/2">
                    <Input
                        placeholder={
                            selectedColumn
                                ? `Search ${selectedColumn}`
                                : "Select column first"
                        }
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[#111] border-gray-700 text-white"
                    />
                    <Button
                        className="bg-[#f5e6d3] text-black hover:bg-[#e8d5bb]"
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </div>

                <div className="flex gap-6 items-center text-sm">
                    <span className="hover:text-[#f5e6d3] cursor-pointer">
                        Analytics
                    </span>
                    <span className="text-[#f5e6d3] font-semibold">Admin</span>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 bg-[#1a1a1a] p-5 border-r border-gray-800 overflow-y-auto">
                    <div className="text-[#f5e6d3] mb-4 font-semibold">
                        Tables
                    </div>
                    {tables.map((table) => (
                        <button
                            key={table}
                            onClick={() => fetchTable(table)}
                            className={`w-full text-left px-3 py-2 rounded-md mb-1 transition ${
                                activeTable === table
                                    ? "bg-[#f5e6d3] text-black font-medium"
                                    : "hover:bg-[#2a2a2a]"
                            }`}
                        >
                            {table}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6 overflow-auto">
                    {!activeTable ? (
                        <div className="text-gray-400 text-center mt-20">
                            Select a table to view data
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-b border-gray-700">
                                        {columns.map((col) => (
                                            <TableHead
                                                key={col}
                                                onClick={() =>
                                                    setSelectedColumn(col)
                                                }
                                                className={`text-white font-semibold text-sm uppercase tracking-wide px-4 py-3 cursor-pointer ${
                                                    selectedColumn === col
                                                        ? "text-[#f5e6d3]"
                                                        : ""
                                                }`}
                                            >
                                                {col}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data.map((row) => (
                                        <TableRow
                                            key={row.pID}
                                            className="border-b border-gray-800 hover:bg-[#121212]"
                                        >
                                            {columns.map((col) => {
                                                const isEditing =
                                                    editingCell?.pID ===
                                                        row.pID &&
                                                    editingCell?.colName ===
                                                        col;

                                                return (
                                                    <TableCell
                                                        key={col}
                                                        className="px-4 py-3 text-sm text-gray-300 cursor-pointer"
                                                        onClick={() =>
                                                            !isEditing &&
                                                            handleEdit(row, col)
                                                        }
                                                    >
                                                        {isEditing ? (
                                                            <Input
                                                                autoFocus
                                                                value={
                                                                    editValue
                                                                }
                                                                onChange={(e) =>
                                                                    setEditValue(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        "Enter"
                                                                    ) {
                                                                        handleSave(
                                                                            row,
                                                                            col,
                                                                        );
                                                                    }
                                                                }}
                                                                className="bg-[#111] border-gray-700 text-white"
                                                            />
                                                        ) : (
                                                            (row[col] ?? "-")
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
