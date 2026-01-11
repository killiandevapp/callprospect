import request from "supertest";
import app from "../app";
import { resetDb } from "../test/resetDb";

beforeAll(async () => {
  await resetDb();
});

describe("Auth API", () => {
  const email = `test_${Date.now()}@test.com`;
  const password = "123456";

  it("POST /api/auth/register -> 201", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBeDefined();
  });

  it("POST /api/auth/login -> 200 + refresh cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    const setCookie = res.headers["set-cookie"] || [];
    const hasRefreshCookie = setCookie.some((c: string) =>
      c.startsWith("refresh_token=")
    );
    expect(hasRefreshCookie).toBe(true);
  });
});
