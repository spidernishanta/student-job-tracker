"use client";
import { useEffect, useState } from "react";
import { Job } from "../types/job";
import JobModal from "./JobModal";
import { useRouter } from "next/navigation";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const BASE_URL = "https://student-job-tracker-backend-9dmx.onrender.com";
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
    window.location.reload();
  };

  const getStatusCounts = () => {
    const counts: { [status: string]: number } = {};
    jobs.forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1;
    });
    return counts;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${BASE_URL}/api/jobs`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (Array.isArray(result?.data)) {
          setJobs(result.data);
          setFilteredJobs(result.data);
          onJobsLoaded(result.data.length > 0);
        } else {
          setJobs([]);
          setFilteredJobs([]);
          console.error("Invalid response format:", result);
          handleLogout();
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
  }, [onRefresh]);

  useEffect(() => {
    let filtered = [...jobs];

    if (statusFilter !== "All") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.company.toLowerCase().includes(term) ||
          job.role.toLowerCase().includes(term)
      );
    }

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.dateOfApplication).getTime();
      const dateB = new Date(b.dateOfApplication).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filter/search changes
  }, [jobs, statusFilter, sortOrder, searchTerm]);

  const resetFilters = () => {
    setStatusFilter("All");
    setSortOrder("newest");
    setSearchTerm("");
  };

  const updateJob = async (jobData: Partial<Job>) => {
    const token = localStorage.getItem("token");
    if (!jobData._id) {
      setError("Invalid job ID");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/jobs/${jobData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const deleteJob = async (jobId: string) => {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  // Pagination Calculations
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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

  const statusCounts = getStatusCounts();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Status Summary */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Status Summary
        </h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium"
            >
              {status}: {count}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            className="rounded-md border-gray-400 text-gray-800 px-2 py-1 focus:border-indigo-500 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted">Ghosted</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            className="rounded-md border-gray-400 text-gray-800 px-2 py-1 focus:border-indigo-500 focus:ring-indigo-500"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Search:</label>
          <input
            type="text"
            placeholder="Search by Company or Role"
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Reset Filters
        </button>
      </div>

      {/* Job Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Date of Application
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <tr key={job._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{job.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{job.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{job.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(job.dateOfApplication).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
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
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  No jobs found matching the criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-center items-center gap-2 bg-gray-50">
          <button
            className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-900"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === i + 1
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 hover:bg-gray-900"
              }`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-900"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
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