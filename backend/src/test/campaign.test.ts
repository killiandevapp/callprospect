import request from "supertest";
import app from "../app";
import { pool } from "../db";
import { resetDb } from "../test/resetDb";

describe("Call API", () => {
  const email = `call_${Date.now()}@test.com`;
  const password = "123456";

  let accessToken: string;
  let cookies: string[];
  let csrfToken: string;

  let meetingProspectId: number;
  let callbackProspectId: number;

  beforeAll(async () => {
    await resetDb();

    // 1) Register
    await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    // 2) Login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    accessToken = loginRes.body.accessToken;
    cookies = (loginRes.headers["set-cookie"] || []) as string[];
    const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="));
    csrfToken = csrfCookie ? csrfCookie.split(";")[0].split("=")[1] : "";

    // 3) Créer une campagne
    const campRes = await request(app)
      .post("/api/campaign")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Campagne calls",
        source: "test",
      });

    expect(campRes.status).toBe(201);

    // 4) Setup campagne + prospects manuels
    const setupRes = await request(app)
      .post("/api/campaign/setup")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        source: "import test",
        refusalReasons: ["Pas intéressé", "Trop cher"],
        manualProspects: [
          { name: "Prospect RDV", phone: "0102030405", notes: "" },
          { name: "Prospect callback", phone: "0607080910", notes: "" },
        ],
      });

    expect(setupRes.status).toBe(200);

    // 5) Récupérer les prospects pour avoir les IDs
    const prosRes = await request(app)
      .get("/api/prospects")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(prosRes.status).toBe(200);
    const list = prosRes.body.prospects as Array<{ id: number; name: string }>;
    expect(list.length).toBeGreaterThanOrEqual(2);

    const pMeeting = list.find((p) => p.name === "Prospect RDV");
    const pCallback = list.find((p) => p.name === "Prospect callback");

    if (!pMeeting || !pCallback) {
      throw new Error("Prospects de test introuvables");
    }

    meetingProspectId = pMeeting.id;
    callbackProspectId = pCallback.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("POST /api/calls (meeting) -> crée un meeting planned et ferme le prospect", async () => {
    const meetingAt = "2026-10-07T10:00:00.000Z";

    const res = await request(app)
      .post("/api/calls")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        prospectId: meetingProspectId,
        result: "meeting",
        durationSec: 30,
        meetingAt,
        meetingLocation: null,
        meetingNotes: "note test",
      });

    expect(res.status).toBe(201);

    // prospect fermé + last_call_result = meeting
    const [prosRows]: any = await pool.query(
      "SELECT status, last_call_result FROM prospects WHERE id = ?",
      [meetingProspectId]
    );

    expect(prosRows[0].status).toBe("closed");
    expect(prosRows[0].last_call_result).toBe("meeting");

    // meeting en base avec status planned
    const [meetRows]: any = await pool.query(
      `
      SELECT m.status
      FROM meetings m
      JOIN call_logs c ON m.call_log_id = c.id
      WHERE c.prospect_id = ?
      `,
      [meetingProspectId]
    );

    expect(meetRows.length).toBe(1);
    expect(meetRows[0].status).toBe("planned");
  });

  it("POST /api/calls (callback) -> crée un meeting interesser et ferme le prospect", async () => {
    const res = await request(app)
      .post("/api/calls")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        prospectId: callbackProspectId,
        result: "callback",
        durationSec: 15,
      });

    expect(res.status).toBe(201);

    // prospect fermé + last_call_result = callback
    const [prosRows]: any = await pool.query(
      "SELECT status, last_call_result FROM prospects WHERE id = ?",
      [callbackProspectId]
    );

    expect(prosRows[0].status).toBe("closed");
    expect(prosRows[0].last_call_result).toBe("callback");

    // meeting en base avec status interesser
    const [meetRows]: any = await pool.query(
      `
      SELECT m.status
      FROM meetings m
      JOIN call_logs c ON m.call_log_id = c.id
      WHERE c.prospect_id = ?
      `,
      [callbackProspectId]
    );

    expect(meetRows.length).toBe(1);
    expect(meetRows[0].status).toBe("interesser");
  });
});
