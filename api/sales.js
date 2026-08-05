// Vercel 서버리스 함수 - 커피 자판기 매출 관리 API
// mode: summary(대시보드), daily(일별 매출), transactions(거래 내역)
// from, to: YYYY-MM-DD 형식 (선택)

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const t0 = Date.now();

  if (req.method !== "GET") return res.status(405).json({ error: "GET만 받습니다" });

  const { mode, from, to, date } = req.query;
  if (!mode) return res.status(400).json({ error: "mode 파라미터 필수 (summary/daily/transactions)" });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  try {
    // 날짜 범위 기본값: 전체 데이터
    let fromDate = from || "1970-01-01";
    let toDate = to || new Date().toISOString().split("T")[0];

    if (mode === "summary") {
      return await getSummary(supabase, res, t0, date);
    } else if (mode === "daily") {
      return await getDaily(supabase, fromDate, toDate, res, t0);
    } else if (mode === "hourly") {
      return await getHourly(supabase, fromDate, toDate, res, t0);
    } else if (mode === "transactions") {
      return await getTransactions(supabase, fromDate, toDate, res, t0);
    } else {
      return res.status(400).json({ error: "mode는 summary/daily/hourly/transactions 중 하나여야 합니다" });
    }
  } catch (error) {
    console.log(JSON.stringify({ event: "sales", ok: false, error: error.message, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: error.message });
  }
}

// 대시보드 요약
async function getSummary(supabase, res, t0, date) {
  // 기준 날짜 설정 (date 파라미터가 없으면 오늘)
  const baseDate = date ? new Date(date + "T00:00:00") : new Date();
  const baseDateStr = baseDate.toISOString().split("T")[0];

  // 선택한 날짜 기준으로 주차, 월 계산
  const today = baseDateStr;

  // 그 주의 월요일 계산
  const dayOfWeek = baseDate.getDay();
  const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(baseDate.setDate(diff));
  const weekAgo = weekStart.toISOString().split("T")[0];

  // 그 달의 1일
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthAgo = monthStart.toISOString().split("T")[0];

  const { data: allSales } = await supabase.from("sales").select("*").order("purchased_at", { ascending: false });

  // 총 매출 & 총 수량
  const totalRevenue = allSales.reduce((sum, row) => sum + row.total_price, 0);
  const totalQuantity = allSales.reduce((sum, row) => sum + row.quantity, 0);

  // 오늘/이번 주/이번 달 매출 & 수량
  const todaySales = allSales.filter(r => r.purchased_at.split("T")[0] === today);
  const weekSales = allSales.filter(r => r.purchased_at.split("T")[0] >= weekAgo);
  const monthSales = allSales.filter(r => r.purchased_at.split("T")[0] >= monthAgo);

  const todayRevenue = todaySales.reduce((sum, r) => sum + r.total_price, 0);
  const todayQuantity = todaySales.reduce((sum, r) => sum + r.quantity, 0);
  const weekRevenue = weekSales.reduce((sum, r) => sum + r.total_price, 0);
  const weekQuantity = weekSales.reduce((sum, r) => sum + r.quantity, 0);
  const monthRevenue = monthSales.reduce((sum, r) => sum + r.total_price, 0);
  const monthQuantity = monthSales.reduce((sum, r) => sum + r.quantity, 0);

  // 인기 상품 TOP 5
  const productSales = {};
  allSales.forEach(r => {
    if (!productSales[r.product]) {
      productSales[r.product] = { quantity: 0, revenue: 0 };
    }
    productSales[r.product].quantity += r.quantity;
    productSales[r.product].revenue += r.total_price;
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }));

  // 단골 고객 TOP 5
  const customerSales = {};
  allSales.forEach(r => {
    if (!customerSales[r.buyer_name]) {
      customerSales[r.buyer_name] = { count: 0, total: 0 };
    }
    customerSales[r.buyer_name].count += 1;
    customerSales[r.buyer_name].total += r.total_price;
  });

  const topCustomers = Object.entries(customerSales)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, data]) => ({ name, count: data.count, total: data.total }));

  // 주말 계산 (그 주의 마지막 날)
  const weekEnd = new Date(new Date(weekAgo).getTime() + 6 * 24 * 60 * 60 * 1000);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  // 월말 계산 (그 달의 마지막 날)
  const monthEnd = new Date(new Date(monthAgo).getFullYear(), new Date(monthAgo).getMonth() + 1, 0);
  const monthEndStr = monthEnd.toISOString().split("T")[0];

  console.log(JSON.stringify({ event: "sales", mode: "summary", ok: true, duration_ms: Date.now() - t0 }));
  return res.status(200).json({
    today,
    weekStart: weekAgo,
    weekEnd: weekEndStr,
    monthStart: monthAgo,
    monthEnd: monthEndStr,
    totalRevenue,
    totalQuantity,
    totalTransactions: allSales.length,
    todayRevenue,
    todayQuantity,
    todayTransactions: todaySales.length,
    weekRevenue,
    weekQuantity,
    weekTransactions: weekSales.length,
    monthRevenue,
    monthQuantity,
    monthTransactions: monthSales.length,
    topProducts,
    topCustomers
  });
}

// 일별 매출
async function getDaily(supabase, fromDate, toDate, res, t0) {
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .gte("purchased_at", fromDate + "T00:00:00")
    .lte("purchased_at", toDate + "T23:59:59")
    .order("purchased_at", { ascending: false });

  const dailyMap = {};
  sales.forEach(row => {
    const date = row.purchased_at.split("T")[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { transactions: 0, revenue: 0, products: {} };
    }
    dailyMap[date].transactions += 1;
    dailyMap[date].revenue += row.total_price;
    if (!dailyMap[date].products[row.product]) {
      dailyMap[date].products[row.product] = 0;
    }
    dailyMap[date].products[row.product] += row.quantity;
  });

  const daily = Object.entries(dailyMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, data]) => ({
      date,
      transactions: data.transactions,
      revenue: data.revenue,
      products: data.products
    }));

  console.log(JSON.stringify({ event: "sales", mode: "daily", ok: true, count: daily.length, duration_ms: Date.now() - t0 }));
  return res.status(200).json(daily);
}

// 시간별 매출
async function getHourly(supabase, fromDate, toDate, res, t0) {
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .gte("purchased_at", fromDate + "T00:00:00")
    .lte("purchased_at", toDate + "T23:59:59")
    .order("purchased_at", { ascending: true });

  const hourlyMap = {};
  for (let h = 0; h < 24; h++) {
    hourlyMap[h] = { transactions: 0, quantity: 0, revenue: 0 };
  }

  sales.forEach(row => {
    const hour = new Date(row.purchased_at).getHours();
    hourlyMap[hour].transactions += 1;
    hourlyMap[hour].quantity += row.quantity;
    hourlyMap[hour].revenue += row.total_price;
  });

  const hourly = Object.entries(hourlyMap).map(([hour, data]) => ({
    hour: String(hour).padStart(2, '0') + ":00",
    transactions: data.transactions,
    quantity: data.quantity,
    revenue: data.revenue
  }));

  console.log(JSON.stringify({ event: "sales", mode: "hourly", ok: true, duration_ms: Date.now() - t0 }));
  return res.status(200).json(hourly);
}

// 거래 내역
async function getTransactions(supabase, fromDate, toDate, res, t0) {
  const { data: transactions } = await supabase
    .from("sales")
    .select("id, buyer_name, product, quantity, price_per_unit, total_price, purchased_at")
    .gte("purchased_at", fromDate + "T00:00:00")
    .lte("purchased_at", toDate + "T23:59:59")
    .order("purchased_at", { ascending: false });

  console.log(JSON.stringify({ event: "sales", mode: "transactions", ok: true, count: transactions.length, duration_ms: Date.now() - t0 }));
  return res.status(200).json(transactions);
}
