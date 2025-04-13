"use client";

import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import JobModal from "../components/JobModal";
import JobsTable from "../components/JobsTable";
import { Job } from "../types/job";

const BASE_URL = "http://localhost:3001";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserName(token);
    }
  }, []);

  const fetchUserName = async (token: string) => {
    setIsFetchingUser(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    } finally {
      setIsFetchingUser(false);
    }
  };

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthError(null);
      fetchUserName(data.token);
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleSignup = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthError(null);
      fetchUserName(data.token);
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError(error instanceof Error ? error.message : "Signup failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName(null);
  };

  const handleAddJob = async (jobData: Partial<Job>) => {
    try {
      const response = await fetch(`${BASE_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error("Failed to create job");

      const data = await response.json();
      setShowAddModal(false);
      setRefreshKey((prev) => prev + 1);
      return data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        {isLoggedIn ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-blue-800">
                  Student Job Tracker
                </h1>
                {isFetchingUser ? (
                  <p className="text-gray-600 animate-pulse mt-1">
                    Fetching user info...
                  </p>
                ) : (
                  userName && (
                    <p className="text-lg text-gray-700 mt-1">
                      Welcome, <span className="font-semibold">{userName}</span>{" "}
                      👋
                    </p>
                  )
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  ➕ Add Job
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6">
              <JobsTable
                key={refreshKey}
                onRefresh={() => setRefreshKey((prev) => prev + 1)}
                onJobsLoaded={(hasJobs) => console.log("Jobs exist:", hasJobs)}
              />
            </div>

            {showAddModal && (
              <JobModal
                onClose={() => setShowAddModal(false)}
                onSuccess={() => setRefreshKey((prev) => prev + 1)}
                onSubmit={handleAddJob}
              />
            )}
          </>
        ) : (
          <div className="text-center mt-32">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Student Job Tracker
            </h1>
            <p className="text-gray-600 mb-8">
              Manage your job hunt like a pro 🚀
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuthModal(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
            error={authError}
          />
        )}
      </div>
    </main>
  );
}
