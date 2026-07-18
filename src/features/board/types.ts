export interface Board {
  id: string;
  workspace_id: string;
  title: string;
  created_by: string;
  created_at: string;
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  position: number;
  assignee_id: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}