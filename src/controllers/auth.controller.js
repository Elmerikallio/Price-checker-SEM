export function login(req, res) {
  res.json({ ok: true, note: "stub login (teammate will implement JWT)" });
}

export function registerStoreSignup(req, res) {
  res.status(201).json({ ok: true, note: "stub signup request created" });
}
