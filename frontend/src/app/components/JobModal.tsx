"use client";
import { useEffect, useState } from "react";
import { Job } from "../types/job";

type JobModalProps = {
  job?: Job | null;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (jobData: Partial<Job>) => Promise<void>;
};

export default function JobModal({
  job: initialData,
  onClose,
  onSuccess,
  onSubmit,
}: JobModalProps) {
  const [formData, setFormData] = useState<Partial<Job>>({
    company: "",
    role: "",
    status: "Applied",
    dateOfApplication: new Date(),
    link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        company: initialData.company,
        role: initialData.role,
        status: initialData.status,
        dateOfApplication: initialData.dateOfApplication,
        link: initialData.link,
      });
    } else {
      setFormData({
        company: "",
        role: "",
        status: "Applied",
        dateOfApplication: new Date(),
        link: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        ...formData,
        dateOfApplication: formData.dateOfApplication || new Date(),
      };

      await onSubmit(submissionData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Edit Job" : "Add New Job"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl font-bold"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Company *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 text-gray-900"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Role *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 text-gray-900"
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Status *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 text-gray-900"
              value={formData.status || "Applied"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Job["status"],
                })
              }
              disabled={isSubmitting}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="On Hold">On Hold</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Date of Application *
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 text-gray-900"
              value={
                formData.dateOfApplication
                  ? new Date(formData.dateOfApplication)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateOfApplication: new Date(e.target.value),
                })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Job Link
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 text-gray-900"
              value={formData.link || ""}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              disabled={isSubmitting}
              placeholder="https://example.com/job"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : initialData
                ? "Update Job"
                : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
