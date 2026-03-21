export interface TaskDto {
  id:           string;
  title:        string;
  emoji:        string | null;
  color:        string;
  behaviorType: number;
  folderId:     string | null;
  status:       number;
  isArchived:   boolean;
  createdAt:    string;
  updatedAt:    string | null;
  categories:   any[];
  folder:       FolderDto | null;
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
