import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { signToken } from "../src/middleware/auth.js";

describe("Authentication & Hashing", () => {
  it("hashes passwords with bcrypt and verifies them accurately", async () => {
    const rawPassword = env.effectiveAdminPassword;
    const hash = await bcrypt.hash(rawPassword, 10);

    const matches = await bcrypt.compare(rawPassword, hash);
    expect(matches).toBe(true);

    const wrongPasswordMatches = await bcrypt.compare("WrongPass@999", hash);
    expect(wrongPasswordMatches).toBe(false);
  });

  it("signs and verifies JWT tokens with correct claims", () => {
    const mockUser = { id: "test-admin-id", role: "admin" as const };
    const token = signToken(mockUser);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
    expect(decoded.sub).toBe("test-admin-id");
    expect(decoded.role).toBe("admin");
  });

  it("provides valid default admin credentials", () => {
    expect(env.effectiveAdminEmail).toBe("admin@scl.local");
    expect(env.effectiveAdminPassword).toBe("Admin@123");
  });
});
