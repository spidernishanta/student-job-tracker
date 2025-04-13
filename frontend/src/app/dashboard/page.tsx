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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (credentials: { email: string; password: string }) => {
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
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleSignup = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
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
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError(error instanceof Error ? error.message : "Signup failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleAddJob = async (jobData: Partial<Job>) => {
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/create`, {
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
      setRefreshKey((prev) => prev + 1); // Refresh table
      return data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {isLoggedIn ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Student Job Tracker</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Job
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>

            <JobsTable
              key={refreshKey}
              onRefresh={() => setRefreshKey((prev) => prev + 1)}
              onJobsLoaded={(hasJobs) => console.log("Jobs exist:", hasJobs)}
            />

            {showAddModal && (
              <JobModal
                onClose={() => setShowAddModal(false)}
                onSuccess={() => setRefreshKey((prev) => prev + 1)}
                onSubmit={handleAddJob}
              />
            )}
          </>
        ) : (
          <div className="text-center space-x-4">
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Sign Up
            </button>
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
