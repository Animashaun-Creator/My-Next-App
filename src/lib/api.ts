// lib/api.ts
import axios from "axios";

const API_URL = "https://686cc59c14219674dcc90faf.mockapi.io/api/v1/users";

export const getUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addUser = async (user: { name: string; email: string }) => {
  const res = await axios.post(API_URL, user);
  return res.data;
};

export const updateUser = async (
  id: string,
  user: { name: string; email: string }
) => {
  const res = await axios.put(`${API_URL}/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};



