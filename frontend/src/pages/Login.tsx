import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(_values: z.infer<typeof loginSchema>) {
    setLoading(true);
    try {
      const res = await fetchApi<{ token: string }>("/api/v1/user/login", {
        method: "POST",
        body: JSON.stringify(_values),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Login successful!");
      if (res.data?.token) {
        Cookies.set("token", res.data.token, { expires: 3 });

        // Check for pending partner invitation
        const partnerToken = localStorage.getItem("partnerToken");
        if (partnerToken) {
          try {
            const acceptRes = await fetchApi("/api/v1/partner/accept", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${res.data.token}`,
              },
              body: JSON.stringify({ token: partnerToken }),
            });
            if (!acceptRes.error) {
              localStorage.removeItem("partnerToken");
              toast.success("Partner invitation accepted!");
            }
          } catch (e) {
            console.error("Failed to accept partner invitation", e);
          }
        }
      }
      navigate("/");
    } catch {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 text-zinc-50 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            GFToolKit
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={loading}
              >
                Log In
              </Button>
              {/* eslint-disable-next-line no-constant-binary-expression */}
              {false && <Button
                type="button"
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => toast.info("Google login not working now")}
              >
                Login with Google (Not working now)
              </Button>
              }
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => navigate("/register")}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create new account?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
