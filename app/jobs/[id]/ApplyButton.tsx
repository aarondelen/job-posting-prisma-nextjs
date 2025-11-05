"use client";

import api from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ApplyButton = ({ jobId }: { jobId: string }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [applicationStatus, setApplicationStatus] =
    useState<"idle" | "success" | "error">("idle");

  const handleClick = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setErrorMessage("");
    setApplicationStatus("idle");
    setLoading(true);

    try {
      await api.post(`/jobs/${jobId}/apply`, {
        userId: session.user.id,
      });

      setApplicationStatus("success");
    } catch (error: any) {
      setErrorMessage(error?.response?.data || "Failed to apply for the job");
      setApplicationStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <button disabled>Loading session...</button>;
  }

  if (applicationStatus === "success") {
    return (
      <div className="text-center">
        <p className="text-green-600 font-medium mb-2">
          🎉 Application submitted successfully!
        </p>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View your applications →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full bg-indigo-600 text-white px-6 py-3 rounded-md font-medium transition ${
          loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-indigo-700 cursor-pointer"
        }`}
      >
        {loading ? "Applying..." : "Apply for this position"}
      </button>

      {applicationStatus === "error" && errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default ApplyButton;
