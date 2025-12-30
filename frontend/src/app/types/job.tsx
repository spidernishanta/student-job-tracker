export interface Job {
  _id: string;
  company: string;
  role: string;
  status: "Applied" | "Test" | "Interview" | "Offer" | "Rejected" | "Ghosted" | "Withdrawn" | "On Hold" | "Archived";
  dateOfApplication: Date;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type JobCreateDTO = Omit<Job, "_id" | "createdAt" | "updatedAt"> & {
  status?: "Applied" | "Test" | "Interview" | "Offer" | "Rejected" | "Ghosted" | "Withdrawn" | "On Hold" | "Archived";
  dateOfApplication?: Date;
  link?: string;
};

export type JobUpdateDTO = Partial<JobCreateDTO>;