const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Helper that every API function uses
async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) message = data.error; 
    } catch {
      // the body wasn't JSON, so keep generic message
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null; // success with no body
  return response.json();
}

export function getAllUsers() {
  return request("/users");
}

export function getUserById(id) {
  return request(`/users/${id}`);
}

export function createUser(formData) {
  return request("/users", { method: "POST", body: formData });
}

export function updateUser(id, formData) {
  return request(`/users/${id}`, { method: "PUT", body: formData });
}

export function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE "});
}

// ---------- build request bodies ----------
// used by create profile form to send everything
export function buildUserFormData({ name, email, bio, major, graduationYear, image, halls, foods }) {
  const [firstName, ...restOfName] = name.trim().split(/\s+/);

  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", restOfName.join(" "));
  formData.append("email", email.trim());
  formData.append("bio", bio.trim());
  formData.append("major", major.trim());
  formData.append("graduationYear", graduationYear.trim());
  formData.append("diningHalls", JSON.stringify(halls ?? []));
  formData.append("favoriteFoods", JSON.stringify(foods ?? []));
  if (image) formData.append("image", image);

  return formData;
}

// used by profile edits to send only changed fields
export function buildUpdateFormData(changes) {
  const formData = new FormData();

  if ("name" in changes) {
    const [firstName, ...restOfName] = changes.name.trim().split(/\s+/);
    formData.append("firstName", firstName);
    formData.append("lastName", restOfName.join(" "));
  }
  for (const key of ["email", "bio", "major", "graduationYear"]) {
    if (key in changes) formData.append(key, changes[key]);
  }
  if ("halls" in changes) formData.append("diningHalls", JSON.stringify(changes.halls));
  if ("foods" in changes) formData.append("favoriteFoods", JSON.stringify(changes.foods));

  if (changes.photoFile) {
    formData.append("image", changes.photoFile);
  } else if ("photoFile" in changes) {
    formData.append("removeImage", "true");
  }

  return formData;
}

export function userToProfile(user) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    graduationYear: user.graduationYear,
    major: user.major,
    bio: user.bio,
    halls: user.diningHalls,
    foods: user.favoriteFoods,
    photoUrl: user.profilePicture ?? "",
  };
}