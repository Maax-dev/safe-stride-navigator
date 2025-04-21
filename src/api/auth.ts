
const BASE_URL = "http://127.0.0.1:5000"; // ⬅️ Change this once if needed later

// UPDATED: Accept contact info in registerUser
export async function registerUser(
  email: string,
  password: string,
  name: string,
  contactName: string,
  contactEmail: string
) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
      emergency_contact: {
        name: contactName,
        email: contactEmail
      }
    })
  });

  const data = await res.json();
  
  // Improved error handling based on status code
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("User already exists");
    } else {
      throw new Error(data.error || data.detail || "Signup failed");
    }
  }
  
  localStorage.setItem("token", data.token);
  return data;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  
  // Improved error handling
  if (!res.ok) {
    throw new Error(data.error || data.detail || "Login failed");
  }
  
  localStorage.setItem("token", data.token);
  return data;
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
