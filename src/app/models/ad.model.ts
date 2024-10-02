export interface Ad {
  id: number;
  type: 'image' | 'video';
  url: string;
  length: number; 
  position: number;
  fill_screen: boolean;
  from_date: Date; 
  to_date: Date; 
  updated_at: string; 
  local_url: string;
}
