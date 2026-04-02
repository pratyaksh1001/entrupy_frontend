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

    // 🔐 INIT
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

    // 📂 FETCH TABLE
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

    // 🔍 SEARCH
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
            console.error("Search failed:", err);
        }
    };

    // ✏️ EDIT
    const handleEdit = (rowIndex, colName, value) => {
        setEditingCell({ rowIndex, colName });
        setEditValue(value);
    };

    const handleSave = async (rowIndex, colName) => {
        try {
            await api.post("/update_table", {
                table: activeTable,
                column: colName,
                value: editValue,
                row: data[rowIndex],
                token: Cookies.get("auth_token"),
            });

            const newData = [...data];
            newData[rowIndex][colName] = editValue;
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
            {/* 🔝 TOP BAR */}
            <div className="w-full bg-[#1a1a1a] px-6 py-4 flex items-center justify-between">
                <div className="flex gap-2 w-1/2">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                </div>

                <div className="flex gap-6">
                    <span>Analytics</span>
                    <span className="text-[#f5e6d3]">Admin</span>
                    <button onClick={handleLogout} className="text-red-400">
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-60 bg-[#1a1a1a] p-4">
                    {tables.map((table) => (
                        <button
                            key={table}
                            onClick={() => fetchTable(table)}
                            className={`block w-full text-left px-3 py-2 rounded ${
                                activeTable === table
                                    ? "bg-[#f5e6d3] text-black"
                                    : "hover:bg-[#333]"
                            }`}
                        >
                            {table}
                        </button>
                    ))}
                </div>

                {/* TABLE */}
                <div className="flex-1 p-6 overflow-auto">
                    {!activeTable ? (
                        <p>Select a table</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableHead
                                            key={col}
                                            onClick={() =>
                                                setSelectedColumn(col)
                                            }
                                            className={`cursor-pointer ${
                                                selectedColumn === col
                                                    ? "text-[#f5e6d3]"
                                                    : ""
                                            }`}
                                        >
                                            {col.toUpperCase()}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow key={i}>
                                        {columns.map((col) => {
                                            const isEditing =
                                                editingCell?.rowIndex === i &&
                                                editingCell?.colName === col;

                                            return (
                                                <TableCell
                                                    key={col}
                                                    onClick={() =>
                                                        !isEditing &&
                                                        handleEdit(
                                                            i,
                                                            col,
                                                            row[col],
                                                        )
                                                    }
                                                >
                                                    {isEditing ? (
                                                        <Input
                                                            autoFocus
                                                            value={editValue}
                                                            onChange={(e) =>
                                                                setEditValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    handleSave(
                                                                        i,
                                                                        col,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        row[col]
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
