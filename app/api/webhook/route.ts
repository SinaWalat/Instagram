import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. Verification Endpoint (DO NOT CHANGE)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Event Receiver (Updated for Comments)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        // Meta stores comments inside the "changes" array
        for (const change of entry.changes || []) {
          if (change.field === 'comments') {
            const commentData = change.value;
            const commentId = commentData.id;
            const commentText = commentData.text;

            console.log(`New comment received: "${commentText}"`);

            // Your custom list of replies
            const replies = [
              "Thank you <3",
              "Thanks <3",
              "Appreciate youuuu <3",
              "7ayatmm <3"
            ];

            // SAFETY CHECK: If the comment is already one of our automated replies, 
            // ignore it so the bot doesn't reply to itself in an infinite loop!
            if (replies.includes(commentText)) {
              console.log("Ignored bot's own reply.");
              continue; // Skip to the next event
            }

            // Pick a random reply from your list
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            // Send the reply back to Instagram
            await sendCommentReply(commentId, randomReply);
          }
        }
      }
      return new Response('EVENT_RECEIVED', { status: 200 });
    }
    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response('Internal Error', { status: 500 });
  }
}

// 3. The Function that sends the reply back to the specific comment
async function sendCommentReply(commentId: string, text: string) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  // Notice this URL is different from the DM one! It targets the specific comment ID.
  const url = `https://graph.facebook.com/v20.0/${commentId}/replies`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: text,
    }),
  });
}
