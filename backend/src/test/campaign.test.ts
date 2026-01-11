import request from "supertest";
import app from "../app";
import { resetDb } from "../test/resetDb";

describe("Campaign API", () => {
  const email = `camp_${Date.now()}@test.com`;
  const password = "123456";

  let accessToken: string;
  let cookies: string[];
  let csrfToken: string;

  beforeAll(async () => {
    await resetDb();

    // Register
    await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    // Login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    accessToken = res.body.accessToken;

    cookies = (res.headers["set-cookie"] || []) as string[];
    const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="));
    csrfToken = csrfCookie ? csrfCookie.split(";")[0].split("=")[1] : "";
  });

  it("GET /api/campaign -> 401 si non connecté", async () => {
    const res = await request(app).get("/api/campaign");
    expect(res.status).toBe(401);
  });

  it("GET /api/campaign -> 200 + [] pour nouvel utilisateur", async () => {
    const res = await request(app)
      .get("/api/campaign")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.campaigns)).toBe(true);
    expect(res.body.campaigns.length).toBe(0);
  });

  it("POST /api/campaign -> 201 crée une campagne", async () => {
    const res = await request(app)
      .post("/api/campaign")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Test campagne",
        source: "test",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("GET /api/campaign -> 200 + 1 campagne après création", async () => {
    const res = await request(app)
      .get("/api/campaign")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.campaigns.length).toBe(1);
    expect(res.body.campaigns[0].name).toBe("Test campagne");
  });
});
