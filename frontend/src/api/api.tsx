import { Job, JobCreateDTO, JobUpdateDTO } from "../app/types/job";

const API_BASE_URL = "https://student-job-tracker-backend-9dmx.onrender.com";

const handleResponse = async (response: Response) => {
  const text = await response.text();
  try {
    if (!response.ok) {
      const error = text
        ? JSON.parse(text)
        : { message: `HTTP Error ${response.status}` };
      throw new Error(
        error.message || `request failed with status ${response.status}`
      );
    }
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("response parsing error:", error);
    throw new Error("failed to process server response");
  }
};

export const jobApi = {
  //create job api
  createJob: async (jobData: JobCreateDTO): Promise<Job> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("create job error:", error);
      throw new Error(
        error instanceof Error ? error.message : "failed to create job"
      );
    }
  },

  //get all jobs api

  getAllJobs: async (): Promise<Job[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      return await handleResponse(response);
    } catch (error) {
      console.error("get jobs error:", error);
      throw new Error(
        error instanceof Error ? error.message : "failed to fetch jobs"
      );
    }
  },

  //update job api
  updateJob: async (
    jobId: string,
    jobData: JobUpdateDTO
  ): Promise<Job> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("update job error:", error);
      throw new Error(
        error instanceof Error ? error.message : "failed to update job"
      );
    }
  },

  // delete job api
  deleteJob: async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error("delete job error:", error);
      throw new Error(
        error instanceof Error ? error.message : "failed to delete job"
      );
    }
  },
};
