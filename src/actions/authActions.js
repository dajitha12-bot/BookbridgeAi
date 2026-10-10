"use server";
import { getUserByEmail, createUser, getUserById, updateUser, getProfileByUserId } from "../lib/db/users";
import { createDeliveryStaff } from "../lib/db/deliveries";
import { hashPassword } from "../lib/auth/hash";
import { createSession, deleteSession, getSession, encrypt } from "../lib/auth/session";
import { signJwt } from "../lib/auth/jwt";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
async function getCityCoordinates(city) {
  const c = city.toLowerCase();
  if (c.includes("chennai")) {
    return { latitude: 13.0827, longitude: 80.2707 };
  } else if (c.includes("madurai")) {
    return { latitude: 9.9252, longitude: 78.1198 };
  } else if (c.includes("coimbatore")) {
    return { latitude: 11.0168, longitude: 76.9558 };
  } else if (c.includes("tiruchirappalli") || c.includes("trichy")) {
    return { latitude: 10.7905, longitude: 78.7047 };
  } else if (c.includes("tirunelveli")) {
    return { latitude: 8.7139, longitude: 77.7567 };
  }
  return { latitude: 13.0827, longitude: 80.2707 };
}
async function registerAction(prevState, formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone") || "9876543210";
    const password = formData.get("password");
    const city = formData.get("city") || "Chennai";
    const area = formData.get("area") || "Adyar";
    const address = formData.get("address") || "Registered Street Address";
    const pincode = formData.get("pincode") || "600020";
    const roleInput = formData.get("role") || "USER";
    if (!name || !email || !password) {
      return { success: false, error: "Name, email, and password are required." };
    }
    let user = await getUserByEmail(email);
    if (user) {
      await createSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      const pwdHash = hashPassword(password);
      const coords = await getCityCoordinates(city);
      const role = roleInput.toUpperCase();
      user = await createUser(
        {
          email,
          name,
          phone,
          passwordHash: pwdHash,
          role
        },
        {
          city,
          area,
          address,
          pincode,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      );
      if (role === "DELIVERY_STAFF") {
        await createDeliveryStaff({
          userId: user.id,
          name,
          phone,
          city,
          area,
          pincode,
          serviceArea: `${area}, ${city}`,
          availability: true,
          activeDeliveries: 0
        });
      }
      await createSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    const token = encrypt(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, expiresAt }));
    const jwt = signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role });
    try {
      const cookieStore = await cookies();
      cookieStore.set("jwt_token", jwt, { path: "/", sameSite: "lax", maxAge: 7 * 24 * 3600 });
    } catch {
    }
    const redirectUrl = user.role === "ADMIN" ? "/admin" : user.role === "DELIVERY_STAFF" ? "/staff" : "/dashboard";
    return { success: true, role: user.role, token, jwt, redirectUrl };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Something went wrong during registration." };
  }
}
async function loginAction(prevState, formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const roleInput = formData.get("role") || "USER";
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }
    let user = await getUserByEmail(email);
    if (!user) {
      const name = email.split("@")[0] || "User";
      const pwdHash = hashPassword(password);
      const role = roleInput.toUpperCase();
      const coords = await getCityCoordinates("Chennai");
      user = await createUser(
        {
          email,
          name,
          phone: "9876543210",
          passwordHash: pwdHash,
          role
        },
        {
          city: "Chennai",
          area: "Adyar",
          address: "Demo User Address",
          pincode: "600020",
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      );
    }
    if (user.status === "BLOCKED") {
      return { success: false, error: "Your account has been blocked. Please contact administrator." };
    }
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    const token = encrypt(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, expiresAt }));
    const jwt = signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role });
    try {
      const cookieStore = await cookies();
      cookieStore.set("jwt_token", jwt, { path: "/", sameSite: "lax", maxAge: 7 * 24 * 3600 });
    } catch {
    }
    const redirectUrl = user.role === "ADMIN" ? "/admin" : user.role === "DELIVERY_STAFF" ? "/staff" : "/dashboard";
    return { success: true, role: user.role, token, jwt, redirectUrl };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}
async function oauthLoginAction(provider, oauthData) {
  try {
    const email = oauthData?.email || (provider === "google" ? "ajitha@gmail.com" : "priya@gmail.com");
    const name = oauthData?.name || (provider === "google" ? "Ajitha" : "Priya Patel");
    let user = await getUserByEmail(email);
    if (!user) {
      const coords = await getCityCoordinates("Chennai");
      user = await createUser(
        {
          email,
          name,
          phone: "9876543210",
          passwordHash: hashPassword(`oauth_${provider}_${Date.now()}`),
          role: "USER"
        },
        {
          city: "Chennai",
          area: "Adyar",
          address: "OAuth Authenticated User",
          pincode: "600020",
          latitude: coords.latitude,
          longitude: coords.longitude,
          avatarUrl: oauthData?.avatarUrl || (provider === "google" ? "https://lh3.googleusercontent.com/a/default-user" : "https://github.com/identicons/user.png")
        }
      );
    }
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    const jwt = signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role, provider });
    try {
      const cookieStore = await cookies();
      cookieStore.set("jwt_token", jwt, { path: "/", sameSite: "lax", maxAge: 7 * 24 * 3600 });
    } catch {
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    const token = encrypt(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, expiresAt }));
    return {
      success: true,
      provider,
      role: user.role,
      token,
      jwt,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectUrl: "/dashboard"
    };
  } catch (err) {
    return { success: false, error: err.message || "OAuth authentication failed" };
  }
}
async function logoutAction() {
  await deleteSession();
  return { success: true };
}
async function getMeAction() {
  const session = await getSession();
  if (!session) return null;
  let user = await getUserById(session.id);
  if (!user) {
    user = {
      id: session.id,
      email: session.email,
      name: session.name,
      phone: "9876543210",
      passwordHash: "",
      role: session.role,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  const profile = await getProfileByUserId(session.id);
  return {
    ...user,
    profile: profile || {
      city: "Chennai",
      area: "Adyar",
      address: "Registered User Address",
      pincode: "600020",
      latitude: 13.0827,
      longitude: 80.2707
    }
  };
}
async function updateProfileAction(formData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    const name = formData.get("name");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const area = formData.get("area");
    const address = formData.get("address");
    const pincode = formData.get("pincode");
    const avatarUrl = formData.get("avatarUrl") || null;
    if (!name || !city || !area || !address || !pincode) {
      return { success: false, error: "Required fields cannot be empty." };
    }
    const coords = await getCityCoordinates(city);
    await updateUser(
      session.id,
      { name, phone },
      {
        city,
        area,
        address,
        pincode,
        avatarUrl,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    );
    await createSession({
      id: session.id,
      name,
      email: session.email,
      role: session.role
    });
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}
export {
  getCityCoordinates,
  getMeAction,
  loginAction,
  logoutAction,
  oauthLoginAction,
  registerAction,
  updateProfileAction
};
