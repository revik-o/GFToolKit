import { useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartHandshake, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvitePartner() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAwaiting, setIsAwaiting] = useState(false);

    const handleInvite = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        const { error, data } = await fetchApi<{ message: string }>("/api/v1/partner/invite", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
        setIsSubmitting(false);

        if (error) {
            toast.error((error as unknown as { message: string }).message || "Failed to send invitation. Please try again.");
            return;
        }

        toast.success(data?.message || "Invitation sent successfully!");
        setIsAwaiting(true);
    };

    const handleRefreshStatus = () => {
        // Reload the page to trigger the ProtectedRoute check again
        globalThis.location.reload();
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0,rgba(0,0,0,0)_50%)] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 backdrop-blur-sm shadow-xl shadow-indigo-900/20">
                        <HeartHandshake className="h-8 w-8 text-indigo-400" />
                    </div>
                </div>

                <Card className="bg-zinc-900/80 border-zinc-800 shadow-2xl backdrop-blur-md">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-zinc-50 tracking-tight">
                            Connect with your Partner
                        </CardTitle>
                        <CardDescription className="text-zinc-400 mt-2">
                            To use GFToolKit, you need to invite your partner to join you.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isAwaiting ? (
                            <div className="flex flex-col items-center text-center space-y-6 py-4">
                                <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 animate-pulse">
                                    <Mail className="h-8 w-8 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-200">Awaiting Partner</h3>
                                    <p className="text-sm text-zinc-400 mt-2">
                                        We've sent an invitation to {email}. It may take a little time for them to accept.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleRefreshStatus}
                                    variant="outline"
                                    className="w-full border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                >
                                    I think they accepted, refresh status
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleInvite} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-zinc-300 block">
                                        Partner's Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="partner@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 h-12 text-sm font-medium transition-all"
                                    disabled={isSubmitting || !email.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Sending Invite...
                                        </>
                                    ) : (
                                        <>
                                            Send Invitation <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-zinc-500 text-sm mt-8">
                    Logged in. Waiting to connect.
                </p>
            </div>
        </div>
    );
}
