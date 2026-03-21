import { FolderDto } from '../../folders/models/folder.models';

export interface TaskDto {
  id:           string;
  title:        string;
  emoji:        string | null;
  color:        string;
  behaviorType: number;
  folderId:     string | null;
  status:       number; // Status corresponds to enums (e.g. 0=Todo)
  isArchived:   boolean;
  createdAt:    string;
  updatedAt:    string | null;
  categories:   any[];
  folder:       FolderDto | null;
}

export interface CreateTaskDto {
  title:        string;
  emoji?:       string | null;
  color:        string;
  behaviorType: number;
  folderId?:    string | null;
}

export interface UpdateTaskDto {
  title:        string;
  emoji?:       string | null;
  color:        string;
  behaviorType: number;
  folderId?:    string | null;
  status:       number;
  isArchived:   boolean;
}

// Additional filters for querying tasks
export interface TaskQueryParams {
  folderId?: string;
  status?:   number;
  archived?: boolean;
}
