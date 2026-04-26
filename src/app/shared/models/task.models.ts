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
  folder:       FolderDto | null;
  totalTrackedSeconds?: number;
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
  categoryIds?: string[];
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
  tasks:     string[];
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
  folderId?:     string;
  status?:       number;
  archived?:     boolean;
  search?:       string;
  behaviorType?: BehaviorCategory;
  PageNumber?:   number;
  PageSize?:     number;
}

export interface PaginationParams {
  PageNumber?: number;
  PageSize?:   number;
}

export interface PaginatedResult<T> {
  items:           T[];
  totalCount:      number;
  pageNumber:      number;
  pageSize:        number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}
