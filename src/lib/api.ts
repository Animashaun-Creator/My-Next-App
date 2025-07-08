//lib/api.ts

// const BASE_URL = 'https://jsonplaceholder.typicode.com';


// export const endpoints = {
//   users: `${BASE_URL}/users`,
//   posts: `${BASE_URL}/posts`,
// };


// // GET users
// export const getUsers = async () => {
//   const res = await fetch(endpoints.users);
//   if (!res.ok) throw new Error('Failed to fetch users');
//   return res.json();
// };

// // POST form data
// export const postFormData = async (data: any) => {
//   const res = await fetch(endpoints.posts, {
//     method: 'POST',
//     body: JSON.stringify(data),
//     headers: { 'Content-Type': 'application/json' },
//   });

//   if (!res.ok) throw new Error('Failed to submit form');
//   return res.json();
// };

// lib/api.ts


const API_BASE = "https://686cc59c14219674dcc90faf.mockapi.io/api/v1";

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const addUser = async (user: { name: string; email: string }) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const updateUser = async (
  id: string,
  user: { name: string; email: string }
) => {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
  });
  return res.json();
};




