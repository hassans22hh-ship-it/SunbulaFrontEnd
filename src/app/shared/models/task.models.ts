import { BehaviorCategory, TaskStatus } from './enums';

export interface TaskDto {
  id:           string;
  title:        string;
  emoji:        string | null;
  color:        string;
  behaviorType: BehaviorCategory;
  folderId:     string | null;
  status:       TaskStatus;
  isArchived:   boolean;
  createdAt:    string;
  updatedAt:    string | null;
  categories:   CategoryDto[];
  folder:       string | null;   // ← string (folder name), NOT FolderDto
}

export interface CreateTaskDto {
  title:        string;
  emoji?:       string;
  color:        string;
  behaviorType: BehaviorCategory;
  folderId?:    string;
  categoryIds?: string[];
}

export interface UpdateTaskDto {
  title:        string;
  emoji?:       string;
  color:        string;
  behaviorType: BehaviorCategory;
  folderId?:    string;
}

export interface CategoryDto {
  id:        string;
  name:      string;
  color:     string;
  createdAt: string;
  taskCount: number;
}

export interface CreateCategoryDto {
  name:  string;
  color: string;
}

export interface UpdateCategoryDto {
  name:  string;
  color: string;
}

export interface FolderDto {
  id:        string;
  name:      string;
  color:     string;
  createdAt: string;
  taskCount: number;
  tasks:     TaskDto[];
}

export interface CreateFolderDto {
  name:  string;
  color: string;
}

export interface UpdateFolderDto {
  name:  string;
  color: string;
}

export interface TaskQueryParams {
  folderId?: string;
  status?:   number;
  archived?: boolean;
}
