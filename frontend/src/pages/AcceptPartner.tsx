import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";

export default function AcceptPartner() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            localStorage.setItem("partnerToken", token);
        }
    }, [token]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-900/20 blur-[100px]" />

            <div className="z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Accept Invitation
                    </h1>
                    <p className="text-zinc-400">
                        You have been invited to join GFToolKit as a partner! Please log in
                        or create a new account to accept this invitation.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-indigo-500 hover:border-indigo-400"
                    >
                        <LogIn size={18} />
                        Log In to Accept
                    </Link>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
                        </div>
                    </div>

                    <Link
                        to="/register"
                        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2.5 px-4 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600"
                    >
                        <UserPlus size={18} />
                        Create an Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
