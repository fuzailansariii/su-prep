"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import useConfirm from "@/hooks/use-confirm";
import { toast } from "sonner";

export default function QuestionActions({
  questionId,
}: {
  questionId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const handleEdit = () => {
    toast.info("Edit functionality coming soon!");
  };

  const handleDelete = async () => {
    const yes = await confirm();
    if (!yes) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/questions/${questionId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete question. Please try again.");
    } finally {
      setIsDeleting(false);
      close();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon-lg"
          variant="ghost"
          className="rounded-xl p-1.5 hover:bg-slate-100 h-8 w-8 text-slate-400 hover:text-brand-primary"
          title="Edit"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          <Pencil size={14} />
        </Button>
        <Button
          size="icon-lg"
          variant="ghost"
          className="rounded-xl p-1.5 hover:bg-red-50 hover:text-red-600 h-8 w-8 text-slate-400"
          title="Delete"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <ConfirmDialog
        open={isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmLabel="Delete Question"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
