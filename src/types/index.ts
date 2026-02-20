// Project & Gallery types — to be extended in later steps
export type ProjectLayout = "grid" | "masonry" | "carousel";
export type AnimationType = "fade" | "slide" | "scale" | "none";

export interface Project {
  id: string;
  title: string;
  layout: ProjectLayout;
  animation: AnimationType;
  images: string[];
  created_at?: string;
}
