import request from "supertest";
import { createApp } from "./src/app.js";

const app = createApp();

const response = await request(app)
  .post("/surveys")
  .send({
    sessionId: "test_campaign",
    skinType: "Oily",
    campaign: "coffee_coupon",
    photoUploaded: false,
  });

console.log("Status:", response.status);
console.log("Body:", JSON.stringify(response.body, null, 2));
