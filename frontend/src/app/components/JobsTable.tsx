"use client";
import { useEffect, useState } from "react";
import { Job } from "../types/job";
import JobModal from "./JobModal";

export default function JobsTable({
  onRefresh,
  onJobsLoaded,
}: {
  onRefresh: () => void;
  onJobsLoaded: (hasJobs: boolean) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (Array.isArray(result?.data)) {
          setJobs(result.data);
          setFilteredJobs(result.data);
        } else {
          setJobs([]);
          setFilteredJobs([]);
          console.error("Invalid response format:", result);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [onRefresh, onJobsLoaded]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...jobs];

    // Status filtering
    if (statusFilter !== "All") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.dateOfApplication).getTime();
      const dateB = new Date(b.dateOfApplication).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(filtered);
  }, [jobs, statusFilter, sortOrder]);

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("All");
    setSortOrder("newest");
  };

  // Update job function
  const updateJob = async (jobData: Partial<Job>) => {
    if (!jobData._id) {
      setError("Invalid job ID");
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      onRefresh();
      setEditingJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    }
  };

  // Delete job function
  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full absolute border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 animate-spin"></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 animate-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-semibold">
            Loading jobs...
          </span>
        </div>
      </div>
    );

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Reset Filters
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date of Application
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <tr key={job._id}>
                <td className="px-6 py-4 whitespace-nowrap">{job.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">{job.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{job.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(job.dateOfApplication).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => setEditingJob(job)}
                    className="px-4 py-2 text-gray-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="px-4 py-2 text-red-700 bg-gray-100 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No jobs found matching the criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editingJob && (
        <JobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={() => {
            onRefresh();
            setEditingJob(null);
          }}
          onSubmit={updateJob}
        />
      )}
    </div>
  );
}