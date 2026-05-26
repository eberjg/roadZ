import { NextResponse } from "next/server";

type SmsRequestBody = {
  to?: string;
  body?: string;
};

function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  );
}

async function sendViaTwilio(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_FROM_NUMBER!.trim();
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("From", from);
  params.set("Body", body);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  const payload = (await response.json()) as { sid?: string; message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Twilio send failed");
  }

  return payload.sid ?? "twilio-sent";
}

export async function POST(request: Request) {
  const body = (await request.json()) as SmsRequestBody;
  const to = body.to?.trim() ?? "";
  const message = body.body?.trim() ?? "";

  if (!to || !message) {
    return NextResponse.json({ error: "Phone number and message are required." }, { status: 400 });
  }

  if (twilioConfigured()) {
    try {
      const messageId = await sendViaTwilio(to, message);
      return NextResponse.json({
        ok: true,
        mode: "twilio",
        contactId: to,
        messageId,
      });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          mode: "twilio",
          contactId: to,
          error: error instanceof Error ? error.message : "Twilio error",
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "simulated",
    contactId: to,
    messageId: `sim-${Date.now()}`,
  });
}
