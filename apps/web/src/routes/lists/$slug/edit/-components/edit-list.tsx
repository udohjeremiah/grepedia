import { useParams } from "@tanstack/react-router";

import { SaveListForm } from "@/routes/lists/-components/save-list-form";

import { useList } from "../../-queries/list";

export function EditList() {
  const { slug } = useParams({ from: "/lists/$slug" });
  const { data: list } = useList({ slug });

  return <SaveListForm list={list} />;
}
