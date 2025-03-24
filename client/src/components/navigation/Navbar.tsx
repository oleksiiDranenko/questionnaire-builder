'use client'

import Link from "next/link"


export default function Navbar() {
    return (
        <div className="w-screen h-16 fixed flex justify-center items-center bg-[#111827]">
            <div className="w-full md:w-2/3 lg:w-1/2 h-full flex justify-around md:justify-between items-center">
                <Link
                    href={'/'}
                    className="w-1/3 h-10 flex justify-center items-center transition hover:bg-slate-800 border border-slate-800 rounded-lg"
                >
                    Home
                </Link>
                <Link
                    href={'/create-quiz'}
                    className="w-1/3 h-10 flex justify-center items-center transition hover:bg-slate-800 border border-slate-800 rounded-lg"
                >
                    Create Quiz
                </Link>
            </div>
        </div>
    )
}