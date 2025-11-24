// frontend/src/app/api/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'meta-llama/Llama-3.2-3B-Instruct';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { depot, maxWeightKg, orders, meta } = body;

  if (!Array.isArray(orders) || orders.length === 0) {
    return NextResponse.json({ error: 'Keine Bestellungen' }, { status: 400 });
  }
  if (!HF_TOKEN) {
    return NextResponse.json({ error: 'HF_TOKEN fehlt' }, { status: 500 });
  }

  const prompt = `Du bist Disponent. Plane Touren. Depot: ${depot.city}. Max ${maxWeightKg} kg pro Tour.
Antworte NUR mit gültigem JSON, nichts anderes!

{
  "tours": [{
    "id": "Tour-1",
    "name": "Tour NRW",
    "region": "Nordrhein-Westfalen",
    "deliveryWindow": "Vormittag",
    "orders": [],
    "weight": 850,
    "stops": 5,
    "distance": 130,
    "aiScore": 88
  }],
  "meta": {"strategy":"PLZ-Clustering"}
}

Bestellungen:
${JSON.stringify(orders, null, 2)}`;

  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          return_full_text: false,
          wait_for_model: true,
          max_time: 120,
        },
      }),
    });

    const text = await res.text();           // immer erst als Text lesen!
    if (!res.ok) {
      console.log('HF nicht ok:', res.status, text);
      return fallback(orders, `KI startet gerade (${res.status})`);
    }

    // HF sagt manchmal "Model is currently loading" → das ist normal beim ersten Mal
    if (text.includes('loading') || text.includes('estimated_time')) {
      return fallback(orders, 'KI-Modell wird geladen – bitte 30–60 Sek warten und nochmal klicken');
    }

    let json;
    try { json = JSON.parse(text); } 
    catch { return fallback(orders, 'KI-Antwort kaputt'); }

    const generated = json[0]?.generated_text || '';
    const match = generated.match(/\{[\s\S]*\}/);
    if (!match) return fallback(orders, 'Kein JSON in KI-Antwort');

    const parsed = JSON.parse(match[0]);
    const tours = Array.isArray(parsed.tours) ? parsed.tours : [];

    return NextResponse.json({ tours, meta: parsed.meta || meta });

  } catch (e) {
    return fallback(orders, 'Unbekannter Fehler');
  }
}

// Immer eine gültige Antwort – nie wieder Crash!
function fallback(orders: any[], msg: string) {
  const total = orders.reduce((s: number, o: any) => s + (o.weight || 0), 0);
  return NextResponse.json({
    tours: [{
      id: 'FB-1',
      name: 'Fallback-Tour',
      region: 'DE/NL',
      deliveryWindow: 'Ganztägig',
      orders: orders,
      weight: total,
      stops: orders.length,
      distance: Math.round(total / 2),
      aiScore: 60,
    }],
    meta: { strategy: `Fallback – ${msg}` },
  });
}