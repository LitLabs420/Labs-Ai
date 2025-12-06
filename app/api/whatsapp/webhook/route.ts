import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage, sendWhatsAppMessage, parseWhatsAppWebhook, verifyWhatsAppWebhook } from '@/lib/whatsapp-bot';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // WhatsApp webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'litlabs_whatsapp_2024';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('x-hub-signature-256');
    
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature (critical security check)
    if (!verifyWhatsAppWebhook(rawBody, signature)) {
      console.error('❌ Invalid webhook signature - potential security threat');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    console.log('✅ Webhook signature verified');
    
    // Parse the body
    const body = JSON.parse(rawBody);
    
    // Parse incoming message
    const message = parseWhatsAppWebhook(body);
    
    if (!message) {
      console.log('No message found in webhook');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    console.log('📱 WhatsApp message received:', message.from, message.body);

    // TODO: Get user ID from phone number mapping
    const userId = 'demo_user'; // In production, look up user by phone

    // Handle message with AI
    const response = await handleWhatsAppMessage(message, userId);

    // Send response
    const sent = await sendWhatsAppMessage(
      response.to,
      response.body,
      response.buttons
    );

    if (sent) {
      console.log('✅ WhatsApp response sent');
    } else {
      console.error('❌ Failed to send WhatsApp response');
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
