export function approveStoreUser(req, res) {
  res.json({ ok: true, action: "approve", id: req.params.id });
}
export function lockStoreUser(req, res) {
  res.json({ ok: true, action: "lock", id: req.params.id });
}
export function unlockStoreUser(req, res) {
  res.json({ ok: true, action: "unlock", id: req.params.id });
}
export function removeStoreUser(req, res) {
  res.json({ ok: true, action: "remove", id: req.params.id });
}
