// Vercel 서버리스 함수 - 커피 주문을 sales 테이블에 저장

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const t0 = Date.now();

  if (req.method !== "POST") return res.status(405).json({ error: "POST만 받습니다" });

  const { buyer_name, product, quantity, price_per_unit, total_price } = req.body || {};
  if (!buyer_name || !product || !quantity || !price_per_unit) {
    console.log(JSON.stringify({ event: "order", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(400).json({ error: "필수 정보 누락" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from("sales")
    .insert({ buyer_name, product, quantity, price_per_unit, total_price })
    .select();

  if (error) {
    console.log(JSON.stringify({ event: "order", ok: false, error: error.message, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: error.message });
  }

  const orderId = data && data[0] ? data[0].id : null;
  console.log(JSON.stringify({ event: "order", ok: true, product, quantity, orderId, duration_ms: Date.now() - t0 }));
  return res.status(200).json({ ok: true, id: orderId });
}
