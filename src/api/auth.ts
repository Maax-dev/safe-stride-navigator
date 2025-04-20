const BASE_URL = "http://127.0.0.1:5000"; // ⬅️ Change this once if needed later

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");
  localStorage.setItem("token", data.token);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  localStorage.setItem("token", data.token);
}

export async function onAuthChanged(callback: (user: any) => void) {
  const token = localStorage.getItem("token");
  if (!token) return callback(null);

  const res = await fetch(`${BASE_URL}/home`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.ok) {
    const user = await res.json();
    callback(user);
  } else {
    callback(null);
  }
}
