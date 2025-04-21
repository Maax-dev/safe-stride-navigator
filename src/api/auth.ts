// Change the BASE_URL to local development server
export const BASE_URL = "http://127.0.0.1:5000"; // Updated to use local backend and now exported

export async function registerUser(
  email: string,
  password: string,
  name: string,
  contactName: string,
  contactEmail: string
) {
  try {
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
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
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
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function onAuthChanged(callback: (user: any) => void) {
  const token = localStorage.getItem("token");
  if (!token) return callback(null);

  try {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Auth check response status:', res.status);

    if (res.ok) {
      const user = await res.json();
      callback(user);
    } else {
      console.error('Auth check failed with status:', res.status);
      callback(null);
    }
  } catch (error) {
    console.error("Auth check error:", error);
    callback(null);
  }
}
