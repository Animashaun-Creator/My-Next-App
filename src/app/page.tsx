"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type User = {
  id: string;
  name: string;
  email: string;
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      toast.success("User added!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset({ name: "", email: "" }); // explicitly reset
    },
    onError: () => toast.error("Failed to add user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: User) => updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditId(null);
      form.reset({ name: "", email: "" }); // ✅ explicit blank reset
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteId(null);
      setShowConfirm(false);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const onSubmit = (values: FormData) => {
    if (editId) {
      updateMutation.mutate({ id: editId, ...values });
    } else {
      addMutation.mutate(values);
    }
  };

  const handleEdit = (user: User) => {
    form.reset({ name: user.name, email: user.email });
    setEditId(user.id);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={addMutation.isPending || updateMutation.isPending}
          >
            {editId
              ? updateMutation.isPending
                ? "Updating..."
                : "Update User"
              : addMutation.isPending
              ? "Adding..."
              : "Add User"}
          </Button>
        </form>
      </Form>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          users.map((user: User) => (
            <div
              key={user.id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(user)}>
                  Edit
                </Button>
                <Dialog open={showConfirm && deleteId === user.id} onOpenChange={setShowConfirm}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete User</DialogTitle>
                      <p>Are you sure you want to delete this user?</p>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(deleteId!)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Confirm"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}



