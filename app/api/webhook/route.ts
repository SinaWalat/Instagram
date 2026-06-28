import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler to process Meta's hub.verify_token and return the hub.challenge.
 * Used by Meta when configuring/verifying the webhook URL in the Developer Portal.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully!");
    // Respond with the challenge token as a plain-text response (required by Meta)
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.error("Webhook verification failed. Token mismatch or invalid mode.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST handler to receive incoming Instagram messaging events and return a 200 OK status immediately.
 * A quick response is required by Meta to prevent delivery retries and webhook temporary suspension.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the payload for visibility in serverless function logs
    console.log("Received Instagram Webhook payload:", JSON.stringify(body, null, 2));

    // Handle payload structure validation (optional, but good practice for debug logs)
    if (body.object === "instagram") {
      // Event parsed successfully
      // Add custom processing logic here (e.g. queuing a job, sending messages)
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook POST request:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload or structure" },
      { status: 400 }
    );
  }
}
