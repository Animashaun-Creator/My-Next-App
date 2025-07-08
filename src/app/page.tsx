// 'use client';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { formSchema } from '@/lib/schema';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from '@/components/ui/form';

// import { getUsers, postFormData } from '@/lib/api'; //

// type FormValues = z.infer<typeof formSchema>;

// export default function Page() {
//   const queryClient = useQueryClient();

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: postFormData,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//       form.reset();
//       alert('Form submitted successfully');
//     },
//   });

//   const { data: users, isLoading } = useQuery({
//     queryKey: ['users'],
//     queryFn: getUsers,
//   });

//   const onSubmit = (values: FormValues) => {
//     mutation.mutate(values);
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Your Name" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email</FormLabel>
//                 <FormControl>
//                   <Input placeholder="email@example.com" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button type="submit" disabled={mutation.isPending}>
//             {mutation.isPending ? 'Submitting...' : 'Submit'}
//           </Button>
//         </form>
//       </Form>

//       <div className="mt-8">
//         <h2 className="text-xl font-semibold">Sample Users</h2>
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <ul className="list-disc list-inside mt-2">
//             {users?.slice(0, 5).map((user: any) => (
//               <li key={user.id}>
//                 {user.name} - {user.email}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }


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

type User = {
  id: string;
  name: string;
  email: string;
};

// Zod schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Form
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      toast.success("User added!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      formMethods.reset();
    },
    onError: () => toast.error("Failed to add user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: User) => updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      formMethods.reset();
      setEditId(null);
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
    formMethods.reset({ name: user.name, email: user.email });
    setEditId(user.id);
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {/* Form */}
      <Form {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={formMethods.control}
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
            control={formMethods.control}
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

          <Button type="submit" className="w-full">
            {editId ? "Update User" : "Add User"}
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
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(user.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}




