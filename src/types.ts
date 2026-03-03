export interface UserData {
    createdAt: any;
    username: string;
    email: string;
    uid: string;
  }
  
  export interface Notification {
    id: string;
    title: string;
    message: string;
    targetType: "all" | "specific";
    targetUsers?: string[];
    createdAt: Date;
    readBy?: string[];
    isRead?: boolean;
  }
  
  export interface ApplicationFormData {
    fullName: string;
    email: string;
    phone: string;
    university: string;
    major: string;
    graduationYear: string;
    skills: string;
    experience: string;
    coverLetter: string;
    resumeFile: File | null;
    resumeUrl: string;
    transcriptFile: File | null;
    transcriptUrl: string;
  }