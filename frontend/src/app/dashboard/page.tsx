"use client";
import { useState } from "react";
import JobModal from "../components/JobModal";
import JobsTable from "../components/JobsTable";
import { Job } from "../types/job";

export default function HomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJobsList, setShowJobsList] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasJobs, setHasJobs] = useState(false);

  const handleAddJob = async (jobData: Partial<Job>) => {
    try {
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create job");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating job:", error);
      setError(error instanceof Error ? error.message : "Failed to create job");
      throw error;
    }
  };

  const handleJobsLoaded = (jobsExist: boolean) => {
    setHasJobs(jobsExist);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-3xl font-bold text-center">
            Student Job Tracker
          </h1>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Job
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <JobsTable
          key={refreshKey}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
          onJobsLoaded={handleJobsLoaded}
        />

        {showAddModal && (
          <JobModal
            onClose={() => {
              setShowAddModal(false);
              setError(null);
            }}
            onSuccess={() => {
              setRefreshKey((prev) => prev + 1);
              setShowAddModal(false);
              setShowJobsList(true);
              setError(null);
            }}
            onSubmit={handleAddJob}
          />
        )}
      </div>
    </main>
  );
}
