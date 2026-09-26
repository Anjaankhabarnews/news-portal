"use client";

import { useParams } from "next/navigation";
import { StoryEditor } from "@/components/newsroom/story-editor";

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  return <StoryEditor key={id} id={id} />;
}
