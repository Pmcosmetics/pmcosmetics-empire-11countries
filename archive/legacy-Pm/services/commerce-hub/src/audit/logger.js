export function createAuditEvent({ actorId = null, action, entityType, entityId, changes = {} }) {
  if (!action || !entityType || !entityId) throw new Error('audit_event_requires_identity');
  return {
    actorId,
    action,
    entityType,
    entityId: String(entityId),
    changes,
    createdAt: new Date().toISOString()
  };
}
